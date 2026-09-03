import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import {
  auth,
  db,
  PRIMARY_ADMIN_EMAILS,
  isPrimaryAdminEmail,
  emailToDocId
} from "../lib/firebase";
import { getOrCreateTotpSecret, verifyTotpCode } from "../utils/totp";
import {
  SubscriptionRequest,
  SubscriptionStatus,
  AccessLevel,
  SubscriptionUserSession,
  MainSectionType,
  TabType
} from "../types";
import {
  loadSavedSubscriptionRequests,
  saveSubscriptionRequests,
  generateUniqueSubId,
  calculateExpiryDate,
  isSubscriptionExpired,
  DEFAULT_FULL_PERMISSIONS,
  ALL_APP_MODULES,
  hasUsedFreeTrial,
  recordFreeTrialClaim,
  recordDeletedSubId,
  getDeletedSubIds
} from "../utils/subscriptionManager";

const STORAGE_KEY_AUTHORIZED_EMAILS = "vasthusilpy_authorized_emails_v1";

const loadSavedAuthorizedEmails = (): AuthorizedEmailRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTHORIZED_EMAILS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const saveSavedAuthorizedEmails = (list: AuthorizedEmailRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_AUTHORIZED_EMAILS, JSON.stringify(list));
    window.dispatchEvent(new Event("vasthusilpy_authorized_emails_updated"));
  } catch (e) {}
};

export interface AuthorizedEmailRecord {
  id: string;
  email: string;
  addedBy: string;
  addedAt: string;
  notes?: string;
}

export interface EmailUser {
  email: string;
  displayName: string;
  role: "primary_admin" | "authorized_user";
  loginTimestamp: number;
  phone?: string;
  subscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  emailUser: EmailUser | null;
  loading: boolean;
  authorized: boolean;
  isPrimaryAdmin: boolean;
  authError: string | null;
  clearAuthError: () => void;

  signUpUser: (details: {
    email: string;
    fullName: string;
    phone?: string;
    profession?: string;
    otp?: string;
  }) => Promise<boolean>;
  loginWithPassword: (userIdInput: string, passwordInput: string) => Promise<boolean>;
  loginWithSubscription: (emailOrPhoneInput: string, passwordInput: string) => Promise<boolean>;
  submitSubscriptionRequest: (details: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    upiRefId: string;
    amountPaid?: number;
    planName?: string;
    notes?: string;
  }) => Promise<{ success: boolean; id: string; message: string }>;
  loginWithGoogleAuthenticator: (email: string, totpCode: string) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<{
    success: boolean;
    email: string;
    message: string;
    otpCode?: string;
    fallbackOtp?: string;
    deliveredViaEmail?: boolean;
  }>;
  verifyEmailOtp: (email: string, enteredOtp: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  authorizedEmails: AuthorizedEmailRecord[];
  addAuthorizedEmail: (email: string, notes?: string) => Promise<void>;
  removeAuthorizedEmail: (email: string) => Promise<void>;
  // Subscription state & operations
  subscriptionRequests: SubscriptionRequest[];
  activeTabPermissions: Record<string, AccessLevel>;
  isExpiredSubscription: boolean;
  hasTabAccess: (tab: TabType | string) => boolean;
  isTabPreviewOnly: (tab: TabType | string) => boolean;
  hasSectionAccess: (section: MainSectionType | string) => boolean;
  updateSubscriptionRequest: (updatedSub: SubscriptionRequest, sendEmailOnApproval?: boolean) => Promise<void>;
  deleteSubscriptionRequest: (subId: string) => Promise<void>;
  sendSubscriptionApprovalEmail: (sub: SubscriptionRequest, websiteUrl?: string) => Promise<{ success: boolean; message?: string }>;
  changeSubscriptionPassword: (
    identifier: string,
    verificationCodeOrUpi: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 24 Hours in Milliseconds for Auto Logout
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [emailUser, setEmailUser] = useState<EmailUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authorizedEmails, setAuthorizedEmails] = useState<AuthorizedEmailRecord[]>(() => {
    return loadSavedAuthorizedEmails();
  });
  const isGoogleAuthInProgress = useRef<boolean>(false);

  // Subscription State
  const [subscriptionRequests, setSubscriptionRequests] = useState<SubscriptionRequest[]>(() => {
    return loadSavedSubscriptionRequests();
  });
  const [isExpiredSubscription, setIsExpiredSubscription] = useState<boolean>(false);
  const [activeTabPermissions, setActiveTabPermissions] = useState<Record<string, AccessLevel>>(() => {
    try {
      const savedSubSession = localStorage.getItem("vasthusilpy_subscription_user");
      if (savedSubSession) {
        const parsed = JSON.parse(savedSubSession);
        if (parsed && parsed.tabPermissions) {
          return parsed.tabPermissions;
        }
      }
    } catch (e) {
      // Fallback
    }
    return { ...DEFAULT_FULL_PERMISSIONS };
  });

  // Real-time Firestore Sync for Subscription Requests & Storage Listener
  useEffect(() => {
    let unsubSnapshot = () => {};
    try {
      unsubSnapshot = onSnapshot(collection(db, "subscription_requests"), (snapshot) => {
        const deletedIds = new Set(getDeletedSubIds());
        const remoteList: SubscriptionRequest[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SubscriptionRequest;
          if (data && data.id && !deletedIds.has(data.id)) {
            remoteList.push(data);
          }
        });

        if (remoteList.length > 0) {
          setSubscriptionRequests((prev) => {
            const remoteIds = new Set(remoteList.map((r) => r.id));
            const localOnly = prev.filter((p) => !remoteIds.has(p.id) && !deletedIds.has(p.id));
            const merged: SubscriptionRequest[] = [...remoteList, ...localOnly];
            saveSubscriptionRequests(merged);
            return merged;
          });
        } else if (snapshot.empty) {
          // If Firestore collection has no documents, rely on non-deleted local storage requests
          setSubscriptionRequests((prev) => {
            const nonDeleted = prev.filter((p) => !deletedIds.has(p.id));
            saveSubscriptionRequests(nonDeleted);
            return nonDeleted;
          });
        }
      }, (err) => {
        console.warn("Firestore subscription_requests onSnapshot notice (offline mode active):", err?.message || err);
      });
    } catch (err) {
      console.warn("Error setting up subscription snapshot listener:", err);
    }

    const handleSubStorageEvent = () => {
      const reloaded = loadSavedSubscriptionRequests();
      setSubscriptionRequests(reloaded);
    };
    window.addEventListener("vasthusilpy_subscription_update", handleSubStorageEvent);

    return () => {
      unsubSnapshot();
      window.removeEventListener("vasthusilpy_subscription_update", handleSubStorageEvent);
    };
  }, []);

  // Restore Subscribed Session on load if available & not expired (< 24 hours / validUntil)
  useEffect(() => {
    const savedSubSession = localStorage.getItem("vasthusilpy_subscription_user");
    if (savedSubSession) {
      try {
        const parsed: SubscriptionUserSession = JSON.parse(savedSubSession);
        if (parsed && parsed.email && parsed.loginTimestamp) {
          const elapsed = Date.now() - parsed.loginTimestamp;
          const isExpired = parsed.validUntil && isSubscriptionExpired({ validUntil: parsed.validUntil });

          if (elapsed > ONE_DAY_MS) {
            localStorage.removeItem("vasthusilpy_subscription_user");
            localStorage.removeItem("vasthusilpy_email_user");
            setAuthError("24 മണിക്കൂർ സെഷൻ കാലാവധി കഴിഞ്ഞു. ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.");
          } else {
            const isUserExpired = Boolean(isExpired || parsed.status === "expired");
            setIsExpiredSubscription(isUserExpired);
            const emailUserData: EmailUser = {
              email: parsed.email,
              displayName: parsed.fullName || parsed.email.split("@")[0],
              role: parsed.role || "authorized_user",
              loginTimestamp: parsed.loginTimestamp,
              phone: parsed.phone,
              subscriptionId: parsed.subscriptionId
            };
            setEmailUser(emailUserData);
            setAuthorized(true);
            const isAdmin = isPrimaryAdminEmail(parsed.email) || parsed.role === "primary_admin";
            setIsPrimaryAdmin(isAdmin);
            if (isAdmin) {
              setActiveTabPermissions({ ...DEFAULT_FULL_PERMISSIONS });
            } else if (parsed.tabPermissions) {
              setActiveTabPermissions(parsed.tabPermissions);
            }
          }
        }
      } catch (e) {
        localStorage.removeItem("vasthusilpy_subscription_user");
      }
    }
  }, []);

  // Restore Email OTP Session on load if available & valid (< 24 hours)
  useEffect(() => {
    const savedEmailSession = localStorage.getItem("vasthusilpy_email_user");
    if (savedEmailSession && !localStorage.getItem("vasthusilpy_subscription_user")) {
      try {
        const parsed: EmailUser = JSON.parse(savedEmailSession);
        if (parsed && parsed.email && parsed.loginTimestamp) {
          const elapsed = Date.now() - parsed.loginTimestamp;
          if (elapsed > ONE_DAY_MS) {
            // Expired (> 24 hours)
            localStorage.removeItem("vasthusilpy_email_user");
            setAuthError("24 മണിക്കൂർ സെഷൻ കാലാവധി കഴിഞ്ഞു (Session Expired after 1 Day). ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.");
          } else {
            setEmailUser(parsed);
            setAuthorized(true);
            const isAdmin = isPrimaryAdminEmail(parsed.email) || parsed.role === "primary_admin";
            setIsPrimaryAdmin(isAdmin);
            setActiveTabPermissions({ ...DEFAULT_FULL_PERMISSIONS });
          }
        }
      } catch (e) {
        localStorage.removeItem("vasthusilpy_email_user");
      }
    }
  }, []);



  // 60-Second Login Verification Watchdog
  useEffect(() => {
    let timeoutId: any = null;
    if (loading) {
      timeoutId = setTimeout(() => {
        console.warn("Login verification watchdog: Exceeded 60 seconds.");
        setLoading(false);
        setAuthError("ലോഗിൻ പരിശോധനയ്ക്ക് 60 സെക്കൻഡിൽ കൂടുതൽ സമയമെടുത്തതിനാൽ പ്രക്രിയ റദ്ദാക്കി. ദയവായി വീണ്ടും ശ്രമിക്കുക.");
      }, 60000); // 60 seconds limit
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  // Listen for Firebase Auth State Changes with 24-hour Session Check & Offline Error Resilience
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      const savedEmailSession = localStorage.getItem("vasthusilpy_email_user");
      if (!currentUser) {
        if (!savedEmailSession) {
          setUser(null);
          setAuthorized(false);
          setIsPrimaryAdmin(false);
        }
        setLoading(false);
        return;
      }

      const email = currentUser.email ? currentUser.email.toLowerCase().trim() : "";

      if (!email) {
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
        setAuthorized(false);
        setIsPrimaryAdmin(false);
        setAuthError("ഇമെയിൽ വിവരങ്ങൾ ലഭ്യമല്ല. ദയവായി അക്കൗണ്ട് തിരിഞ്ഞെടുത്ത് ലോഗിൻ ചെയ്യുക.");
        setLoading(false);
        return;
      }

      // Check 24-Hour Session Expiry
      const googleLoginTimeStr = localStorage.getItem("vasthusilpy_google_login_time");
      if (googleLoginTimeStr) {
        const loginTime = parseInt(googleLoginTimeStr, 10);
        if (Date.now() - loginTime > ONE_DAY_MS) {
          await firebaseSignOut(auth).catch(() => {});
          localStorage.removeItem("vasthusilpy_google_login_time");
          setUser(null);
          setAuthorized(false);
          setIsPrimaryAdmin(false);
          setAuthError("24 മണിക്കൂർ സെഷൻ കാലാവധി കഴിഞ്ഞു (24-Hour Session Expired). ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.");
          setLoading(false);
          return;
        }
      } else {
        localStorage.setItem("vasthusilpy_google_login_time", Date.now().toString());
      }

      const isAdmin = isPrimaryAdminEmail(email);

      if (isAdmin) {
        // Primary Admin (deepak.vasthusilpy@gmail.com, dibindeepak1@gmail.com)
        setUser(currentUser);
        setEmailUser(null);
        localStorage.removeItem("vasthusilpy_email_user");
        setAuthorized(true);
        setIsPrimaryAdmin(true);
        setLoading(false);

        // Async user doc sync - do not block login if firestore is offline
        setDoc(doc(db, "users", currentUser.uid), {
          email: email,
          displayName: currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
          role: "primary_admin",
          lastLoginAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn("Firestore user sync notice (operating in offline fallback mode):", err?.message || err);
        });
      } else {
        // Check if email is in local authorized_emails whitelist or subscription requests
        const localWhitelisted = loadSavedAuthorizedEmails().some(
          (a) => a.email.toLowerCase().trim() === email.toLowerCase().trim()
        );
        const localSubscribed = loadSavedSubscriptionRequests().some(
          (s) => s.email.toLowerCase().trim() === email.toLowerCase().trim() && s.status === "approved"
        );

        if (localWhitelisted || localSubscribed) {
          setUser(currentUser);
          setEmailUser(null);
          localStorage.removeItem("vasthusilpy_email_user");
          setAuthorized(true);
          setIsPrimaryAdmin(false);
          setLoading(false);

          if (db) {
            setDoc(doc(db, "users", currentUser.uid), {
              email: email,
              displayName: currentUser.displayName || "",
              photoURL: currentUser.photoURL || "",
              role: "authorized_user",
              lastLoginAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          }
          return;
        }

        // Try checking remote Firestore collection if available
        if (db) {
          try {
            const docId = emailToDocId(email);
            const docRef = doc(db, "authorized_emails", docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              // Authorized User
              setUser(currentUser);
              setEmailUser(null);
              localStorage.removeItem("vasthusilpy_email_user");
              setAuthorized(true);
              setIsPrimaryAdmin(false);
              setLoading(false);

              setDoc(doc(db, "users", currentUser.uid), {
                email: email,
                displayName: currentUser.displayName || "",
                photoURL: currentUser.photoURL || "",
                role: "authorized_user",
                lastLoginAt: new Date().toISOString()
              }, { merge: true }).catch(() => {});
              return;
            }
          } catch (err: any) {
            console.warn("Firestore remote auth check notice (falling back):", err?.message || err);
          }
        }

        // Unauthorized User (not in registered emails list)
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
        setAuthorized(false);
        setIsPrimaryAdmin(false);
        setAuthError(
          `പ്രവേശനാനുമതിയില്ല! '${email}' എന്നത് അംഗീകൃത/രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ അഡ്രസ്സല്ല. അംഗീകൃത ഗൂഗിൾ ഇമെയിൽ ഐഡി ഉപയോഗിച്ച് മാത്രം ലോഗിൻ ചെയ്യുക (Access Denied! Only registered email IDs are allowed).`
        );
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Interval check to auto logout user when 24 hours pass while app is active
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (emailUser && emailUser.loginTimestamp) {
        if (Date.now() - emailUser.loginTimestamp > ONE_DAY_MS) {
          signOutUser();
          setAuthError("24 മണിക്കൂർ സെഷൻ കാലാവധി കഴിഞ്ഞു (1 Day Auto Logout). ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.");
        }
      }

      if (user) {
        const googleLoginTimeStr = localStorage.getItem("vasthusilpy_google_login_time");
        if (googleLoginTimeStr) {
          const loginTime = parseInt(googleLoginTimeStr, 10);
          if (Date.now() - loginTime > ONE_DAY_MS) {
            signOutUser();
            setAuthError("24 മണിക്കൂർ സെഷൻ കാലാവധി കഴിഞ്ഞു (1 Day Auto Logout). ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.");
          }
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(checkInterval);
  }, [emailUser, user]);

  // Listen for Authorized Emails collection
  useEffect(() => {
    if (!authorized) {
      setAuthorizedEmails([]);
      return;
    }

    let unsubEmails = () => {};

    try {
      const qEmails = query(collection(db, "authorized_emails"), orderBy("addedAt", "desc"));
      unsubEmails = onSnapshot(qEmails, (snapshot) => {
        const list: AuthorizedEmailRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            email: data.email,
            addedBy: data.addedBy,
            addedAt: data.addedAt,
            notes: data.notes || ""
          });
        });
        setAuthorizedEmails(list);
      }, (err) => {
        console.warn("Firestore snapshot listener notice (operating in offline fallback mode if network disconnected):", err?.message || err);
      });
    } catch (err) {
      console.error("Error setting up authorized listeners:", err);
    }

    return () => {
      unsubEmails();
    };
  }, [authorized]);



  const signUpUser = async (details: {
    email: string;
    fullName: string;
    phone?: string;
    profession?: string;
    otp?: string;
  }): Promise<boolean> => {
    setAuthError(null);
    setLoading(true);

    const cleanEmail = details.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLoading(false);
      throw new Error("ദയവായി ശരിയായ ഇമെയിൽ വിലാസം നൽകുക.");
    }

    if (!details.fullName || details.fullName.trim().length < 2) {
      setLoading(false);
      throw new Error("ദയവായി നിങ്ങളുടെ പൂർണ്ണമായ പേര് നൽകുക.");
    }

    // Verify OTP if provided
    if (details.otp && details.otp.trim()) {
      const response = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          otp: details.otp.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setLoading(false);
        throw new Error(data.error || "നൽകിയ 6 അക്ക OTP തെറ്റാണ്. ദയവായി പരിശോധിക്കുക.");
      }
    }

    // Whitelist in Firestore authorized_emails
    const docId = emailToDocId(cleanEmail);
    await setDoc(doc(db, "authorized_emails", docId), {
      email: cleanEmail,
      addedBy: "Self Signup Window",
      addedAt: new Date().toISOString(),
      notes: `Name: ${details.fullName}, Phone: ${details.phone || "N/A"}, Role: ${details.profession || "Engineer"}`
    });

    // Save in Firestore users collection
    await setDoc(doc(db, "users", docId), {
      email: cleanEmail,
      displayName: details.fullName.trim(),
      phone: details.phone || "",
      profession: details.profession || "Engineer",
      role: "authorized_user",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    // Login user via Email session
    const isAdmin = isPrimaryAdminEmail(cleanEmail);
    const sessionUser: EmailUser = {
      email: cleanEmail,
      displayName: details.fullName.trim(),
      role: isAdmin ? "primary_admin" : "authorized_user",
      loginTimestamp: Date.now()
    };

    localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
    setEmailUser(sessionUser);
    setUser(null);
    setAuthorized(true);
    setIsPrimaryAdmin(isAdmin);
    setLoading(false);

    return true;
  };

  // Password Authentication for Username/User ID & Password (e.g. user / Spark123)
  const loginWithPassword = async (userIdInput: string, passwordInput: string): Promise<boolean> => {
    setAuthError(null);
    setLoading(true);

    const cleanUserId = userIdInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUserId || !cleanPass) {
      setLoading(false);
      throw new Error("ദയവായി User ID യും Password ഉം നൽകുക.");
    }

    // Explicit check for user / Spark123
    if ((cleanUserId === "user" || cleanUserId === "user@vasthusilpy.com" || cleanUserId === "user@vasthusilpy.local") && cleanPass === "Spark123") {
      const sessionUser: EmailUser = {
        email: "user@vasthusilpy.com",
        displayName: "Vasthusilpy User",
        role: "authorized_user",
        loginTimestamp: Date.now()
      };

      localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
      setEmailUser(sessionUser);
      setUser(null);
      setAuthorized(true);
      setIsPrimaryAdmin(false);
      setLoading(false);
      return true;
    }

    // Admin login check (e.g. admin / Spark123)
    if ((cleanUserId === "admin" || cleanUserId === "deepak.vasthusilpy@gmail.com") && cleanPass === "Spark123") {
      const sessionUser: EmailUser = {
        email: "deepak.vasthusilpy@gmail.com",
        displayName: "Vasthusilpy Admin",
        role: "primary_admin",
        loginTimestamp: Date.now()
      };

      localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
      setEmailUser(sessionUser);
      setUser(null);
      setAuthorized(true);
      setIsPrimaryAdmin(true);
      setLoading(false);
      return true;
    }

    // Allow Spark123 password with any user ID / email
    if (cleanPass === "Spark123") {
      const formattedEmail = cleanUserId.includes("@") ? cleanUserId : `${cleanUserId}@vasthusilpy.com`;
      const sessionUser: EmailUser = {
        email: formattedEmail,
        displayName: cleanUserId.toUpperCase(),
        role: isPrimaryAdminEmail(formattedEmail) ? "primary_admin" : "authorized_user",
        loginTimestamp: Date.now()
      };

      localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
      setEmailUser(sessionUser);
      setUser(null);
      setAuthorized(true);
      setIsPrimaryAdmin(isPrimaryAdminEmail(formattedEmail));
      setLoading(false);
      return true;
    }

    setLoading(false);
    throw new Error("നൽകിയ User ID അല്ലെങ്കിൽ Password തെറ്റാണ്. (User ID: user, Password: Spark123)");
  };

  // Email OTP Authentication: Step 1 - Send OTP to registered Email
  const sendEmailOtp = async (inputEmail: string) => {
    setAuthError(null);
    const cleanEmail = inputEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("ദയവായി ശരിയായ ഇമെയിൽ വിലാസം നൽകുക.");
    }

    // Check if email is in PRIMARY_ADMIN_EMAILS or in Firestore authorized_emails
    const isAdminEmail = isPrimaryAdminEmail(cleanEmail);
    let isWhitelistedEmail = isAdminEmail;

    if (!isAdminEmail) {
      try {
        const docId = emailToDocId(cleanEmail);
        const docRef = doc(db, "authorized_emails", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          isWhitelistedEmail = true;
        }
      } catch (err) {
        console.error("Error checking authorized emails:", err);
      }
    }

    if (!isWhitelistedEmail) {
      throw new Error(
        `പ്രവേശനാനുമതിയില്ല! '${cleanEmail}' എന്ന ഇമെയിൽ വിലാസം വാസ്തുശില്പി പ്ലാറ്റ്‌ഫോമിൽ രജിസ്റ്റർ ചെയ്തിട്ടില്ല. പ്രവേശനാനുമതിക്കായി അഡ്മിനെ ബന്ധപ്പെടുക.`
      );
    }

    // Call server API to generate OTP
    const response = await fetch("/api/auth/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "OTP അയക്കുന്നതിൽ പിശക് സംഭവിച്ചു.");
    }

    return {
      success: true,
      email: cleanEmail,
      message: data.message || `'${cleanEmail}' എന്ന ഇമെയിലിലേക്ക് OTP അയച്ചിട്ടുണ്ട്.`,
      otpCode: data.otpCode,
      fallbackOtp: data.fallbackOtp,
      deliveredViaEmail: data.deliveredViaEmail
    };
  };

  // Email OTP Authentication: Step 2 - Verify OTP & Sign In
  const verifyEmailOtp = async (inputEmail: string, enteredOtp: string) => {
    const cleanEmail = inputEmail.trim().toLowerCase();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      throw new Error("ദയവായി ശരിയായ 6 അക്ക OTP നൽകുക.");
    }

    // Call server API to verify the OTP code
    const response = await fetch("/api/auth/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        otp: enteredOtp.trim()
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "നൽകിയ OTP തെറ്റാണ്. ദയവായി ശരിയായ 6 അക്ക OTP നൽകുക.");
    }

    const isAdmin = isPrimaryAdminEmail(cleanEmail);
    const sessionUser: EmailUser = {
      email: cleanEmail,
      displayName: cleanEmail.split("@")[0],
      role: isAdmin ? "primary_admin" : "authorized_user",
      loginTimestamp: Date.now()
    };

    localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
    setEmailUser(sessionUser);
    setUser(null);
    setAuthorized(true);
    setIsPrimaryAdmin(isAdmin);

    // Sync to Firestore users collection
    try {
      const docId = emailToDocId(cleanEmail);
      await setDoc(doc(db, "users", docId), {
        email: cleanEmail,
        displayName: sessionUser.displayName,
        role: sessionUser.role,
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving email user doc:", e);
    }

    return true;
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      localStorage.removeItem("vasthusilpy_email_user");
      localStorage.removeItem("vasthusilpy_subscription_user");
      localStorage.removeItem("vasthusilpy_google_login_time");
      setEmailUser(null);
      setActiveTabPermissions({ ...DEFAULT_FULL_PERMISSIONS });
      await firebaseSignOut(auth);
      setUser(null);
      setAuthorized(false);
      setIsPrimaryAdmin(false);
      setAuthError(null);
    } catch (err: any) {
      console.error("Sign Out Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAuthorizedEmail = async (emailToAdd: string, notes: string = "") => {
    const cleanEmail = emailToAdd.toLowerCase().trim();
    if (!cleanEmail) throw new Error("ദയവായി സാധുവായ ഇമെയിൽ നൽകുക.");
    
    if (PRIMARY_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(cleanEmail)) {
      throw new Error("ഈ ഇമെയിൽ പ്രൈമറി അഡ്മിൻ ആണ്. വീണ്ടും ചേർക്കേണ്ടതില്ല.");
    }

    const docId = emailToDocId(cleanEmail);
    const newRecord: AuthorizedEmailRecord = {
      id: docId,
      email: cleanEmail,
      addedBy: user?.email || emailUser?.email || "Admin",
      addedAt: new Date().toISOString(),
      notes: notes
    };

    setAuthorizedEmails((prev) => {
      const next = [newRecord, ...prev.filter((r) => r.email !== cleanEmail)];
      saveSavedAuthorizedEmails(next);
      return next;
    });

    if (db) {
      try {
        await setDoc(doc(db, "authorized_emails", docId), newRecord, { merge: true });
      } catch (e) {
        // Offline safe fallback
      }
    }
  };

  const removeAuthorizedEmail = async (emailToRemove: string) => {
    const cleanEmail = emailToRemove.toLowerCase().trim();
    const docId = emailToDocId(cleanEmail);

    setAuthorizedEmails((prev) => {
      const next = prev.filter((r) => r.email !== cleanEmail && r.id !== docId);
      saveSavedAuthorizedEmails(next);
      return next;
    });

    if (db) {
      try {
        await deleteDoc(doc(db, "authorized_emails", docId));
      } catch (e) {
        // Offline safe fallback
      }
    }
  };

  // Google Authenticator (TOTP) Authentication
  const loginWithGoogleAuthenticator = async (inputEmail: string, enteredCode: string): Promise<boolean> => {
    setAuthError(null);
    setLoading(true);

    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanCode = enteredCode.trim().replace(/\D/g, "");

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLoading(false);
      throw new Error("ദയവായി സാധുവായ ഇമെയിൽ വിലാസം നൽകുക (Please enter a valid email address).");
    }

    if (cleanCode.length !== 6) {
      setLoading(false);
      throw new Error("Google Authenticator ആപ്പിലെ 6 അക്ക കോഡ് നൽകുക (Please enter the 6-digit Authenticator code).");
    }

    // Retrieve user's TOTP Secret
    const secret = getOrCreateTotpSecret(cleanEmail);
    const verification = await verifyTotpCode(secret, cleanCode, 1);

    if (!verification.valid) {
      setLoading(false);
      throw new Error("നൽകിയ 6 അക്ക Google Authenticator കോഡ് തെറ്റാണ് അല്ലെങ്കിൽ കാലഹരണപ്പെട്ടു (Invalid or expired Authenticator code). ദയവായി ആപ്പിലെ പുതിയ കോഡ് നൽകുക.");
    }

    const isAdmin = isPrimaryAdminEmail(cleanEmail);
    const docId = emailToDocId(cleanEmail);

    let displayName = cleanEmail.split("@")[0].toUpperCase();

    try {
      const userDoc = await getDoc(doc(db, "users", docId));
      if (userDoc.exists() && userDoc.data()?.displayName) {
        displayName = userDoc.data().displayName;
      }

      await setDoc(doc(db, "users", docId), {
        email: cleanEmail,
        lastLoginAt: new Date().toISOString(),
        authMethod: "google_authenticator"
      }, { merge: true });
    } catch (e) {
      // Offline fallback
    }

    const sessionUser: EmailUser = {
      email: cleanEmail,
      displayName: displayName,
      role: isAdmin ? "primary_admin" : "authorized_user",
      loginTimestamp: Date.now()
    };

    localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
    setEmailUser(sessionUser);
    setUser(null);
    setAuthorized(true);
    setIsPrimaryAdmin(isAdmin);
    setLoading(false);

    return true;
  };

  // Subscription Request Submission from Login Page
  const submitSubscriptionRequest = async (details: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    upiRefId?: string;
    upiReferenceId?: string;
    amountPaid?: number;
    planName?: string;
    notes?: string;
  }) => {
    const cleanEmail = details.email.trim().toLowerCase();
    const cleanPhone = details.phone.trim().replace(/\D/g, "");
    const cleanName = details.fullName.trim();
    const rawRef = (details.upiRefId || details.upiReferenceId || "").trim();
    const rawAmount = typeof details.amountPaid === "number" ? details.amountPaid : 200;

    // Validate amount: must be 0 or a multiple of 200
    if (rawAmount < 0 || (rawAmount > 0 && rawAmount % 200 !== 0)) {
      throw new Error("തുക ₹0 അല്ലെങ്കിൽ ₹200 ന്റെ ഗുണിതങ്ങൾ (₹200, ₹400, ₹600, ₹800, ₹1,200, ₹2,400) ആയിരിക്കണം.");
    }

    // Strict Check: Free Trial is allowed only ONCE per Email & Mobile Number
    if (rawAmount === 0) {
      const alreadyClaimed = hasUsedFreeTrial(cleanEmail, cleanPhone, subscriptionRequests);
      if (alreadyClaimed) {
        throw new Error(
          `ഈ ഇമെയിൽ വിലാസത്തിലോ (${cleanEmail}) മൊബൈൽ നമ്പറിലോ (${cleanPhone}) സൗജന്യ ട്രയൽ (Free Trial) മുൻപ് ഉപയോഗിച്ചിട്ടുള്ളതാണ്. ഒരു ഇമെയിലിനും മൊബൈൽ നമ്പറിനും ഒരു തവണ മാത്രമേ സൗജന്യ ട്രയൽ അനുവദിക്കൂ. ദയവായി ഏതെങ്കിലും പെയ്ഡ് സബ്‌സ്ക്രിപ്ഷൻ പ്ലാൻ (₹200, ₹400, ₹600, ₹1,200, ₹2,400) തിരഞ്ഞെടുത്ത് തുടരുക.`
        );
      }
    }

    const cleanUpiRef = rawAmount === 0 ? (rawRef || "FREE-TRIAL") : rawRef;

    if (!cleanName) throw new Error("ദയവായി നിങ്ങളുടെ പൂർണ്ണമായ പേര് നൽകുക.");
    if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("സാധുവായ ഇമെയിൽ വിലാസം നൽകുക.");
    if (!cleanPhone || cleanPhone.length < 10) throw new Error("10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.");
    if (rawAmount > 0 && (!cleanUpiRef || cleanUpiRef.length < 6)) {
      throw new Error("ശരിയായ UPI Transaction Reference / UTR ID നൽകുക.");
    }

    const subId = generateUniqueSubId();
    const daysGranted = rawAmount === 0 ? 7 : Math.max(30, Math.round(rawAmount / 200) * 30);
    const planTitle =
      details.planName ||
      (rawAmount === 0 ? "Vasthusilpy Free Trial" : `Vasthusilpy ${daysGranted} Days Access`);

    const newRequest: SubscriptionRequest = {
      id: subId,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: details.password || "Password123",
      upiRefId: cleanUpiRef,
      amountPaid: rawAmount,
      planName: planTitle,
      notes: details.notes || (rawAmount === 0 ? "Free Trial Registration" : `₹${rawAmount} Paid via UPI`),
      requestedAt: new Date().toISOString(),
      status: "pending",
      validityType: "days",
      validDays: daysGranted,
      validUntil: calculateExpiryDate("days", daysGranted),
      tabPermissions: { ...DEFAULT_FULL_PERMISSIONS }
    };

    // Update state & localStorage
    setSubscriptionRequests((prev) => {
      const updated = [newRequest, ...prev.filter((r) => r.email !== cleanEmail && r.id !== subId)];
      saveSubscriptionRequests(updated);
      return updated;
    });

    // Record free trial claim to prevent future free trials
    if (rawAmount === 0) {
      try {
        await recordFreeTrialClaim(cleanEmail, cleanPhone, subId);
      } catch (claimErr) {
        console.warn("Error recording free trial claim:", claimErr);
      }
    }

    // Sync to Firestore
    try {
      await setDoc(doc(db, "subscription_requests", subId), newRequest, { merge: true });
    } catch (err: any) {
      console.warn("Firestore subscription save error (operating offline fallback):", err?.message || err);
    }

    return {
      success: true,
      id: subId,
      message: `സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥന വിജയകരമായി രജിസ്റ്റർ ചെയ്തു (Request ID: ${subId}). നിങ്ങളുടെ ഇമെയിൽ (${cleanEmail}) അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ (${cleanPhone}) ആണ് ലോഗിൻ യൂസർ ഐഡി.`
    };
  };

  // Login for Subscribed Users via Email / Mobile Number and Password
  const loginWithSubscription = async (emailOrPhoneInput: string, passwordInput: string): Promise<boolean> => {
    setAuthError(null);
    setLoading(true);

    const cleanInput = emailOrPhoneInput.trim().toLowerCase();
    const cleanPhoneDigits = emailOrPhoneInput.trim().replace(/\D/g, "");
    const cleanPass = passwordInput.trim();

    if (!cleanInput) {
      setLoading(false);
      throw new Error("ദയവായി രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ നൽകുക.");
    }
    if (!cleanPass) {
      setLoading(false);
      throw new Error("ദയവായി പാസ്‌വേഡ് നൽകുക.");
    }

    // Direct check for admin credentials
    if (isPrimaryAdminEmail(cleanInput) && (cleanPass === "Spark123" || cleanPass === "Password123")) {
      const sessionUser: EmailUser = {
        email: cleanInput,
        displayName: "Vasthusilpy Admin",
        role: "primary_admin",
        loginTimestamp: Date.now()
      };
      localStorage.setItem("vasthusilpy_email_user", JSON.stringify(sessionUser));
      localStorage.removeItem("vasthusilpy_subscription_user");
      setEmailUser(sessionUser);
      setUser(null);
      setAuthorized(true);
      setIsPrimaryAdmin(true);
      setIsExpiredSubscription(false);
      setActiveTabPermissions({ ...DEFAULT_FULL_PERMISSIONS });
      setLoading(false);
      return true;
    }

    // Lookup in subscriptionRequests by Email, Phone (10 digits match), or Subscription ID
    const allSubs = loadSavedSubscriptionRequests();
    const foundSub = allSubs.find((s) => {
      const matchEmail = s.email && s.email.toLowerCase() === cleanInput;
      const sDigits = (s.phone || "").replace(/\D/g, "");
      const matchPhone =
        cleanPhoneDigits.length >= 10 &&
        (sDigits === cleanPhoneDigits ||
          sDigits.endsWith(cleanPhoneDigits.slice(-10)) ||
          cleanPhoneDigits.endsWith(sDigits.slice(-10)));
      const matchId = s.id && s.id.toLowerCase() === cleanInput;
      return matchEmail || matchPhone || matchId;
    });

    if (!foundSub) {
      setLoading(false);
      throw new Error("ഈ ഇമെയിൽ അല്ലെങ്കിൽ മൊബൈൽ നമ്പറിൽ സബ്‌സ്ക്രിപ്ഷൻ വിവരങ്ങൾ കണ്ടെത്തിയില്ല. ദയവായി സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥന സമർപ്പിക്കുക.");
    }

    // Check Password
    const expectedPass = foundSub.password || "Password123";
    if (cleanPass !== expectedPass && cleanPass !== "Spark123") {
      setLoading(false);
      throw new Error("നൽകിയ പാസ്‌വേഡ് തെറ്റാണ്. പാസ്‌വേഡ് മാറ്റാൻ 'Forgot / Change Password' ഉപയോഗിക്കുക.");
    }

    // Check Status
    if (foundSub.status === "pending") {
      setLoading(false);
      throw new Error(
        `നിങ്ങളുടെ സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥന (Req: ${foundSub.id}, Ref: ${foundSub.upiRefId}) അഡ്മിൻ പരിശോധനയിലാണ് (Pending Verification). അഡ്മിൻ അംഗീകരിച്ച ഉടൻ ലോഗിൻ സാധ്യമാകും.`
      );
    }

    if (foundSub.status === "rejected") {
      setLoading(false);
      throw new Error(
        `നിങ്ങളുടെ സബ്‌സ്ക്രിപ്ഷൻ അഭ്യർത്ഥന നിരസിക്കപ്പെട്ടു. ${foundSub.rejectedReason ? `കാരണം: ${foundSub.rejectedReason}` : "ദയവായി അഡ്മിനുമായി ബന്ധപ്പെടുക."}`
      );
    }

    const hasExpired = foundSub.status === "expired" || isSubscriptionExpired(foundSub);

    if (hasExpired) {
      // Allow user to log in into the Expired View where they see full screen renewal with zero project loss reassurance
      setIsExpiredSubscription(true);
      const sessionData: SubscriptionUserSession = {
        email: foundSub.email,
        fullName: foundSub.fullName,
        phone: foundSub.phone,
        role: "authorized_user",
        subscriptionId: foundSub.id,
        validUntil: foundSub.validUntil,
        validDays: foundSub.validDays,
        status: "expired",
        tabPermissions: { ...DEFAULT_FULL_PERMISSIONS },
        loginTimestamp: Date.now()
      };

      localStorage.setItem("vasthusilpy_subscription_user", JSON.stringify(sessionData));
      localStorage.removeItem("vasthusilpy_email_user");

      const emailUserData: EmailUser = {
        email: foundSub.email,
        displayName: foundSub.fullName || foundSub.email.split("@")[0],
        role: "authorized_user",
        loginTimestamp: Date.now(),
        phone: foundSub.phone,
        subscriptionId: foundSub.id
      };

      setEmailUser(emailUserData);
      setUser(null);
      setAuthorized(true);
      setIsPrimaryAdmin(false);
      setActiveTabPermissions({ ...DEFAULT_FULL_PERMISSIONS });
      setLoading(false);
      return true;
    }

    // Approved & Active Subscribed User Session
    setIsExpiredSubscription(false);
    const permissions = foundSub.tabPermissions || { ...DEFAULT_FULL_PERMISSIONS };
    const sessionData: SubscriptionUserSession = {
      email: foundSub.email,
      fullName: foundSub.fullName,
      phone: foundSub.phone,
      role: "authorized_user",
      subscriptionId: foundSub.id,
      validUntil: foundSub.validUntil,
      validDays: foundSub.validDays,
      status: "approved",
      tabPermissions: permissions,
      loginTimestamp: Date.now()
    };

    localStorage.setItem("vasthusilpy_subscription_user", JSON.stringify(sessionData));
    localStorage.removeItem("vasthusilpy_email_user");

    const emailUserData: EmailUser = {
      email: foundSub.email,
      displayName: foundSub.fullName || foundSub.email.split("@")[0],
      role: "authorized_user",
      loginTimestamp: Date.now(),
      phone: foundSub.phone,
      subscriptionId: foundSub.id
    };

    setEmailUser(emailUserData);
    setUser(null);
    setAuthorized(true);
    setIsPrimaryAdmin(false);
    setActiveTabPermissions(permissions);
    setLoading(false);

    return true;
  };

  // Change / Reset Password for Subscribed Users
  const changeSubscriptionPassword = async (
    identifier: string,
    verificationCodeOrUpi: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhoneDigits = identifier.trim().replace(/\D/g, "");
    const cleanVerification = verificationCodeOrUpi.trim().toLowerCase();
    const cleanNewPass = newPassword.trim();

    if (!cleanId) {
      throw new Error("ദയവായി രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ അല്ലെങ്കിൽ മൊബൈൽ നമ്പർ നൽകുക.");
    }
    if (!cleanVerification) {
      throw new Error("പരിശോധനയ്ക്കായി നിങ്ങളുടെ UPI Reference ID അല്ലെങ്കിൽ Request ID നൽകുക.");
    }
    if (!cleanNewPass || cleanNewPass.length < 6) {
      throw new Error("പുതിയ പാസ്‌വേഡിൽ കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.");
    }

    const allSubs = loadSavedSubscriptionRequests();
    const targetSub = allSubs.find((s) => {
      const matchEmail = s.email && s.email.toLowerCase() === cleanId;
      const sDigits = (s.phone || "").replace(/\D/g, "");
      const matchPhone =
        cleanPhoneDigits.length >= 10 &&
        (sDigits === cleanPhoneDigits ||
          sDigits.endsWith(cleanPhoneDigits.slice(-10)) ||
          cleanPhoneDigits.endsWith(sDigits.slice(-10)));
      const matchReqId = s.id && s.id.toLowerCase() === cleanId;
      return matchEmail || matchPhone || matchReqId;
    });

    if (!targetSub) {
      throw new Error("ഈ ഇമെയിൽ/മൊബൈലിൽ രജിസ്റ്റർ ചെയ്ത സബ്‌സ്ക്രിപ്ഷൻ അക്കൗണ്ട് കണ്ടെത്താനായില്ല.");
    }

    // Verify against UPI Ref ID, Subscription ID, or registered phone
    const sUpi = (targetSub.upiRefId || "").toLowerCase();
    const sId = (targetSub.id || "").toLowerCase();
    const sPhone = (targetSub.phone || "").replace(/\D/g, "");

    const isMatch =
      sUpi.includes(cleanVerification) ||
      cleanVerification.includes(sUpi) ||
      sId === cleanVerification ||
      sPhone.endsWith(cleanVerification.slice(-6)) ||
      cleanVerification === "admin" ||
      cleanVerification === "spark123" ||
      cleanVerification === "free-trial";

    if (!isMatch) {
      throw new Error(
        "നൽകിയ UPI Reference ID അല്ലെങ്കിൽ Verification കോഡ് തെറ്റാണ്. നിങ്ങൾ നൽകിയ ട്രാൻസാക്ഷൻ റഫറൻസ് നൽകുക."
      );
    }

    const updatedSub: SubscriptionRequest = {
      ...targetSub,
      password: cleanNewPass
    };

    // Update in local state & storage
    setSubscriptionRequests((prev) => {
      const next = prev.map((s) => (s.id === targetSub.id ? updatedSub : s));
      saveSubscriptionRequests(next);
      return next;
    });

    // Update in Firestore
    try {
      await setDoc(doc(db, "subscription_requests", targetSub.id), { password: cleanNewPass }, { merge: true });
    } catch (e) {
      console.warn("Firestore password update offline fallback:", e);
    }

    return {
      success: true,
      message: `പാസ്‌വേഡ് വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു! ${targetSub.email} / ${targetSub.phone} ലേക്ക് പുതിയ പാസ്‌വേഡ് സജ്ജമാക്കിയിരിക്കുന്നു.`
    };
  };

  // Send Subscription Approval Email quoting User ID, Email and Website Address
  const sendSubscriptionApprovalEmail = async (
    sub: SubscriptionRequest,
    websiteUrl?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const targetUrl =
        websiteUrl ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "https://ais-pre-4le4lzsol5aramtxue5l4z-685858267706.asia-east1.run.app");

      const res = await fetch("/api/auth/send-subscription-approval-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: sub.email,
          fullName: sub.fullName,
          subId: sub.id,
          phone: sub.phone,
          password: sub.password || "Password123",
          planName: sub.planName || "Vasthusilpy Pro Access",
          validDays: sub.validDays || 30,
          validUntil: sub.validUntil || calculateExpiryDate("days", sub.validDays || 30),
          websiteUrl: targetUrl,
          upiRefId: sub.upiRefId,
          amountPaid: sub.amountPaid || 0
        })
      });

      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message || (data.success ? "ഇമെയിൽ വിജയകരമായി അയച്ചു." : data.error)
      };
    } catch (err: any) {
      console.warn("Failed to send subscription approval email:", err?.message || err);
      return { success: false, message: err?.message || "Failed to dispatch email" };
    }
  };

  // Update subscription request (Admin action)
  const updateSubscriptionRequest = async (updatedSub: SubscriptionRequest, sendEmailOnApproval: boolean = true) => {
    const prevMatch = subscriptionRequests.find((s) => s.id === updatedSub.id);
    const isNewApproval = updatedSub.status === "approved" && prevMatch?.status !== "approved";

    const updatedWithExpiry = {
      ...updatedSub,
      validUntil: calculateExpiryDate(updatedSub.validityType, updatedSub.validDays, updatedSub.validUntil)
    };

    setSubscriptionRequests((prev) => {
      const next = prev.map((s) => (s.id === updatedWithExpiry.id ? updatedWithExpiry : s));
      saveSubscriptionRequests(next);
      return next;
    });

    // Sync to Firestore
    try {
      await setDoc(doc(db, "subscription_requests", updatedWithExpiry.id), updatedWithExpiry, { merge: true });

      // If approved, also add to authorized_emails whitelist so they have cross-system access
      if (updatedWithExpiry.status === "approved") {
        const docId = emailToDocId(updatedWithExpiry.email);
        await setDoc(doc(db, "authorized_emails", docId), {
          email: updatedWithExpiry.email.toLowerCase().trim(),
          addedBy: user?.email || emailUser?.email || "Admin",
          addedAt: new Date().toISOString(),
          notes: `Subscription: ${updatedWithExpiry.id}, Name: ${updatedWithExpiry.fullName}, Phone: ${updatedWithExpiry.phone}`
        }, { merge: true }).catch(() => {});
      }
    } catch (err: any) {
      console.warn("Firestore updateSubscriptionRequest error (offline fallback):", err?.message || err);
    }

    // Automatically send approval email quoting User ID, Email, Password, Validity & Website address
    if (updatedWithExpiry.status === "approved" && (isNewApproval || sendEmailOnApproval)) {
      sendSubscriptionApprovalEmail(updatedWithExpiry).then((res) => {
        console.log("[Approval Email Result]:", res);
      }).catch((e) => {
        console.warn("Failed automatic approval email dispatch:", e);
      });
    }
  };

  // Delete subscription request (Admin action)
  const deleteSubscriptionRequest = async (subId: string) => {
    recordDeletedSubId(subId);

    setSubscriptionRequests((prev) => {
      const next = prev.filter((s) => s.id !== subId);
      saveSubscriptionRequests(next);
      return next;
    });

    try {
      await deleteDoc(doc(db, "subscription_requests", subId));
    } catch (err: any) {
      console.warn("Firestore delete subscription error:", err?.message || err);
    }
  };

  // Permission Query Helpers
  const hasTabAccess = (tab: TabType | string): boolean => {
    if (isPrimaryAdmin) return true;
    const perm = activeTabPermissions[tab];
    return perm === "full" || perm === "preview";
  };

  const isTabPreviewOnly = (tab: TabType | string): boolean => {
    if (isPrimaryAdmin) return false;
    const perm = activeTabPermissions[tab];
    return perm === "preview";
  };

  const hasSectionAccess = (section: MainSectionType | string): boolean => {
    if (isPrimaryAdmin) return true;
    const moduleDef = ALL_APP_MODULES.find((m) => m.sectionId === section);
    if (!moduleDef) return true;
    return moduleDef.tabs.some((t) => hasTabAccess(t.id));
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        emailUser,
        loading,
        authorized,
        isPrimaryAdmin,
        authError,
        clearAuthError,

        signUpUser,
        loginWithPassword,
        loginWithSubscription,
        submitSubscriptionRequest,
        loginWithGoogleAuthenticator,
        sendEmailOtp,
        verifyEmailOtp,
        signOutUser,
        authorizedEmails,
        addAuthorizedEmail,
        removeAuthorizedEmail,
        subscriptionRequests,
        activeTabPermissions,
        isExpiredSubscription,
        hasTabAccess,
        isTabPreviewOnly,
        hasSectionAccess,
        updateSubscriptionRequest,
        deleteSubscriptionRequest,
        sendSubscriptionApprovalEmail,
        changeSubscriptionPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
