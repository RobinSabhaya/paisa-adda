const { successColor, errorColor } = require('../helper/color.helper');
const { VERSION_TYPES, APP_TYPES } = require('../helper/constant.helper');
const Version = require('../models/version.model');

const versionData = [
    {
        config: {
            primary: '#FF4E00',
            theme_mode: 'light',
            privacy: 'https://happypet.care/privacy-policy',
            terms: 'https://happypet.care/terms-condition',
            about_us: 'https://happypet.care/about-us',
            play_store_link: 'https://play.google.com/store/apps/details?id=com.happypet.breeder',
            app_store_link:
                'https://apps.apple.com/us/app/happy-breeder-dog-kennel-mgmt/id6499210295',
            app_type: APP_TYPES.breeder,
        },
        android: {
            version: '1.0.0',
            version_type: VERSION_TYPES.android,
            force_update: false,
            soft_update: false,
            maintenance: false,
            app_type: APP_TYPES.breeder,
        },
        iOS: {
            version: '1.0.0',
            version_type: VERSION_TYPES.ios,
            force_update: false,
            soft_update: false,
            maintenance: false,
            app_type: APP_TYPES.breeder,
        },
    },
    {
        config: {
            primary: '#FF4E00',
            theme_mode: 'light',
            privacy: 'https://happypet.care/privacy-policy',
            terms: 'https://happypet.care/terms-condition',
            about_us: 'https://happypet.care/about-us',
            play_store_link: 'https://play.google.com/store/apps/details?id=com.happypet.petparent',
            app_store_link: 'https://apps.apple.com/us/app/happy-pet-for-pet-parents/id6501954174',
            app_type: APP_TYPES.parentsPet,
        },
        android: {
            version: '1.0.0',
            version_type: VERSION_TYPES.android,
            force_update: false,
            soft_update: false,
            maintenance: false,
            app_type: APP_TYPES.parentsPet,
        },
        iOS: {
            version: '1.0.0',
            version_type: VERSION_TYPES.ios,
            force_update: false,
            soft_update: false,
            maintenance: false,
            app_type: APP_TYPES.parentsPet,
        },
    },
];

/**
 * Version seeder.
 */
module.exports = versionSeeder = async () => {
    try {
        for (let version of versionData) {
            const existAndroid = await Version.findOne({
                version_type: VERSION_TYPES.android,
                app_type: version.android.app_type,
            });
            if (!existAndroid && Object.keys(version)[1] === VERSION_TYPES.android)
                await Version.create(version.android);

            const existiOS = await Version.findOne({
                version_type: VERSION_TYPES.ios,
                app_type: version.android.app_type,
            });
            if (!existiOS && Object.keys(version)[2] === VERSION_TYPES.ios)
                await Version.create(version.iOS);

            const existAppConfig = await Version.findOne({
                version_type: VERSION_TYPES.config,
                'app_config.app_type': version.config.app_type,
            });

            if (!existAppConfig)
                await Version.create({
                    app_config: version.config,
                    default_config: true,
                    version_type: VERSION_TYPES.config,
                });
        }

        console.log(successColor, '✅ Version seeder run successfully...');
    } catch (error) {
        console.log(errorColor, '❌ Error from version seeder :', error);
    }
};
