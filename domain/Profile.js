import merge from 'merge';
import { AppIds, PublicFields } from "@smontero/ppp-common";
import BaseDomain from './BaseDomain';
import { VerificationApi } from "../service";
import { AccessTypes } from "../const";
import { Util } from "../util";

class Profile extends BaseDomain {

    static _getCommInfo(commVerified, comm, maskFn) {
        if (comm == null) {
            return {
                exists: false,
                needsToVerify: false,
            }
        } else {
            return {
                exists: true,
                needsToVerify: !commVerified,
                verifiedAt: commVerified ? commVerified : null,
                mask: maskFn(comm),
                value: comm,
            };
        }
    }

    static restrictAccess(profile, accessType = AccessTypes.PUBLIC) {
        if (accessType === AccessTypes.ADMIN) {
            return profile;
        }

        const {
            appId,
            app,
            eosAccount,
            publicData,
            privateData,
        } = profile;

        let processed = {
            eosAccount,
            appId,
            app,
            publicData
        };
        if (appId === AppIds.BASE_PROFILE_APP) {
            const {
                commPref,
                emailVerified,
                emailAddress,
                smsVerified,
                smsNumber,
            } = profile;

            if (accessType === AccessTypes.OWNER) {
                processed = {
                    ...processed,
                    commPref,
                    emailInfo: this._getCommInfo(emailVerified, emailAddress, Util.maskEmail),
                    smsInfo: this._getCommInfo(smsVerified, smsNumber, Util.maskSmsNumber),
                };
            }
        }
        if (accessType === AccessTypes.OWNER) {
            processed.privateData = privateData;
        }
        return processed;
    }

    constructor(app, eosAccount, profile) {
        super();
        this.app = app;
        this.eosAccount = eosAccount;
        this.emailChanged = false;
        this.smsChanged = false;
        this.profile = this._init(eosAccount, profile);
        this._setIsVerified();
    }

    _init(eosAccount, profile) {
        if (!profile) {
            profile = this._getInitState(AppIds.BASE_PROFILE_APP, eosAccount);
            console.log(' Base Profile not found. Created one: ', profile);
        }
        return profile;
    }

    _getInitState(appId, eosAccount) {
        const date = Date.now();
        return {
            appId,
            eosAccount,
            createdAt: date,
            updatedAt: date,
        };
    }

    isVerified() {
        const { profile } = this;
        return Math.max(profile.emailVerified || 0, profile.smsVerified || 0);
    }

    _setIsVerified() {
        this.profile.publicData = this.profile.publicData || {};
        this.profile.publicData[PublicFields.IS_VERIFIED] = this.isVerified();
    }

    _updateEmail(profile, newEmailAddress) {
        console.log(" _updateEmail, profile  : ", profile);
        console.log(" _updateEmail, newEmailAddress    : ", newEmailAddress);

        if (newEmailAddress && newEmailAddress != profile.emailAddress) {
            profile.emailVerified = 0;
            profile.emailAddress = newEmailAddress;
            console.log(" new email: ", newEmailAddress);
            this.emailChanged = true;
        }
    }

    _updateSms(profile, newSmsNumber) {
        console.log(" _updateSms, profile  : ", profile);
        console.log(" _updateSms, newSmsNumber    : ", newSmsNumber);

        if (newSmsNumber && newSmsNumber != profile.smsNumber) {
            profile.smsVerified = 0;
            profile.smsNumber = newSmsNumber;
            console.log(" smsNumber    : ", newSmsNumber);
            this.smsChanged = true;
        }
    }

    verifySmsOtp(smsOtp) {
        const { profile } = this;
        if (smsOtp != profile.smsOtp.toString()) {
            throw new Error(`Invalid SMS Verify Code: ${smsOtp}`);
        }
        profile.smsVerified = Date.now();
        this._setIsVerified();
    }

    verifyEmailOtp(emailOtp) {
        const { profile } = this;
        if (emailOtp != profile.emailOtp.toString()) {
            throw new Error(`Invalid Email Verify Code: ${emailOtp}`);
        }
        profile.emailVerified = Date.now();
        this._setIsVerified();
    }

    async update(newProfile) {
        let {
            smsNumber,
            emailAddress,
            appData,
            commPref,
            publicData,
            privateData,
        } = newProfile;
        const profile = this.profile;

        this._updateEmail(profile, emailAddress);
        this._updateSms(profile, smsNumber);

        if (commPref) profile.commPref = commPref;

        ({ emailAddress, smsNumber, commPref } = profile);

        if (!emailAddress && !smsNumber) {
            throw "smsNumber or emailAddress is required for a new user";
        }

        if (commPref == 'EMAIL' && !emailAddress) {
            throw "emailAddress is required if commPref is set to EMAIL";
        } else if (commPref == 'SMS' && !smsNumber) {
            throw "smsNumber is required if commPref is set to SMS";
        }
        console.log(`Email Changed: ${this.emailChanged} Sms Changed: ${this.smsChanged}`);
        this.emailChanged && (profile.emailOtp = await VerificationApi.sendEmailOtp(emailAddress));
        this.smsChanged && (profile.smsOtp = await VerificationApi.sendSmsOtp(smsNumber));
        this.mergeData(profile, publicData, privateData);
        if (appData) {
            const { appId } = this.app;
            if (!profile.appData) {
                profile.appData = this._getInitState(appId, this.eosAccount);
                console.log(` Profile for app: ${appId} not found. Creating new: `, profile.appData);
            }
            this.mergeData(profile.appData, appData.publicData, appData.privateData, true);
            profile.appData.app = Profile.getEntityDetails('app', this.app);
            console.log('Profile: ', this.profile);
        }
        Util.deleteNullsAndEmptyStrings(profile);
        this._setIsVerified();
    }

    mergeData(profile, publicData, privateData) {
        profile.publicData = merge.recursive(profile.publicData, publicData);
        if (privateData) {
            profile.privateData = merge.recursive(profile.privateData, privateData);
        }
        profile.updatedAt = Date.now();
    }

    get(accessType = AccessTypes.PUBLIC) {
        let processed = Profile.restrictAccess(this.profile, accessType);
        if (this.profile.appData) {
            processed.appData = Profile.restrictAccess(this.profile.appData, accessType);
        }
        return processed;

    }
}

Profile.ENTITY_FIELDS = {
    app: [
        {
            field: 'name'
        },
    ],
};


export default Profile;