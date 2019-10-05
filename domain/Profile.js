import merge from 'merge';
import BaseDomain from './BaseDomain';
import { VerificationApi } from "../service";
import { AppIds, ProfileAccessTypes } from "../const";
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
            };
        }
    }

    static restrictAccess(profile, accessType = ProfileAccessTypes.PUBLIC) {
        if (accessType === ProfileAccessTypes.ADMIN) {
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

            if (accessType === ProfileAccessTypes.OWNER) {
                processed = {
                    ...processed,
                    commPref,
                    emailInfo: this._getCommInfo(emailVerified, emailAddress, Util.maskEmail),
                    smsInfo: this._getCommInfo(smsVerified, smsNumber, Util.maskSmsNumber),
                };
            }
        }
        if (accessType === ProfileAccessTypes.OWNER) {
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

    updateEmail(profile, newEmailAddress) {
        console.log(" updateEmail, profile  : ", profile);
        console.log(" updateEmail, newEmailAddress    : ", newEmailAddress);

        if (newEmailAddress && newEmailAddress != profile.emailAddress) {
            profile.emailVerified = 0;
            profile.emailAddress = newEmailAddress;
            console.log(" new email: ", newEmailAddress);
            this.emailChanged = true;
        }
    }

    updateSms(profile, newSmsNumber) {
        console.log(" updateSms, profile  : ", profile);
        console.log(" updateSms, newSmsNumber    : ", newSmsNumber);

        if (newSmsNumber && newSmsNumber != profile.smsNumber) {
            profile.smsVerified = 0;
            profile.smsNumber = newSmsNumber;
            console.log(" smsNumber    : ", newSmsNumber);
            this.smsChanged = true;
        }
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

        this.updateEmail(profile, emailAddress);
        this.updateSms(profile, smsNumber);

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
            this.mergeData(profile.appData, appData.publicData, appData.privateData);
            profile.appData.app = Profile.getEntityDetails('app', this.app);
            console.log('Profile: ', this.profile);
        }
    }

    mergeData(profile, publicData, privateData) {
        profile.publicData = merge.recursive(profile.publicData, publicData);
        if (privateData) {
            profile.privateData = merge.recursive(profile.privateData, privateData);
        }
        profile.updatedAt = Date.now();
    }

    get(accessType = ProfileAccessTypes.PUBLIC) {
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
            field: 'appName'
        },
    ],
};


export default Profile;