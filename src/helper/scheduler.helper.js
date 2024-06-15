const schedule = require('node-schedule');
const { schedulerService, userService } = require('../services');
const path = require('path');
const config = require('../config/config');
const { sendEmail } = require('../services/email.service');
const { capitalizeFirstLetter } = require('./function.helper');

let rule = new schedule.RecurrenceRule();

const startScheduler = async (schedulerId, schedulerDate) => {
    rule.minute = new Date(schedulerDate).getMinutes();
    rule.hour = new Date(schedulerDate).getHours();
    rule.second = new Date(schedulerDate).getSeconds();
    rule.tz = 'Asia/Calcutta'; // Kolkatta, Asia;
    const scheduleName = String(schedulerId);

    /** Start schedule job */
    schedule.scheduleJob(scheduleName, rule, async () => {
        /** check schedule is exist */
        const existsJobSchedule = await schedulerService.getSchedulerById(schedulerId);
        let getUserDetails = await userService.getBreederDetails({
            _id: existsJobSchedule.user,
            is_active: true,
            deletedAt: null,
        });

        let canWeSendMail = false;
        let currDateTime = new Date(schedulerDate);
        currDateTime.setSeconds(currDateTime.getSeconds() + 5);
        if (
            existsJobSchedule &&
            getUserDetails &&
            new Date(existsJobSchedule.next_mail_date) < currDateTime
        ) {
            let mailData = {
                mobile_verification: false,
                about_you: false,
                kennel_info: false,
            };
            if (!getUserDetails.is_mobile_verified) {
                canWeSendMail = true;
                mailData.onboarding_link = `${config.front_url}/breeder-registration/register/number`;
                mailData.mobile_verification = false;
                mailData.subject = 'Verify your mobile number!';
                mailData.main_heading = 'It’s time to share your story 🧡';
                mailData.message =
                    "You've taken the first step in joining our community but there's more to explore! We're here to assist you every step of the way.";
            } else if (
                !getUserDetails.first_name ||
                !getUserDetails.last_name ||
                !getUserDetails.gender ||
                !getUserDetails.speak_language.length
            ) {
                canWeSendMail = true;
                mailData.about_you = false;
                mailData.mobile_verification = true;
                mailData.onboarding_link = `${config.front_url}/breeder-registration/about-you`;
                mailData.subject = 'Tell me about your self!';
                mailData.main_heading = 'Reach your potential customer ✨';
                mailData.message =
                    "We know you're excited to start your journey with us and we can't wait to help you do it. But first, we need to make sure your profile is complete and ready to go.";
            } else if (
                !getUserDetails?.breeder_kennel?.year_established ||
                !getUserDetails?.breeder_kennel?.street_address ||
                !getUserDetails?.breeder_kennel?.city ||
                !getUserDetails?.breeder_kennel?.state ||
                !getUserDetails?.breeder_kennel?.pin_code ||
                !getUserDetails?.breeder_breed
            ) {
                canWeSendMail = true;
                (mailData.first_name =
                    capitalizeFirstLetter(getUserDetails?.first_name) || 'Breeder'),
                    (mailData.kennel_info = false);
                mailData.about_you = true;
                mailData.mobile_verification = true;
                mailData.onboarding_link = `${config.front_url}/breeder-registration/dog-kennel`;
                mailData.subject = 'Add your kennel info!';
                mailData.main_heading = 'Finish your onboarding today 🤩';
                mailData.message =
                    'You are one step closer to engage with your customers on Happy Pet and connecting with the community. ';
            }

            if (canWeSendMail) {
                await sendEmail(
                    getUserDetails.email,
                    mailData.subject,
                    mailData,
                    path.join(__dirname, '../../views/onboardingIncomplete.ejs')
                );

                const currentDate = new Date();
                const lastMailDate = new Date();

                await schedulerService.updateSchedular(existsJobSchedule.user, {
                    last_mail_date: lastMailDate,
                    next_mail_date: new Date(currentDate.setMinutes(currentDate.getMinutes() + 1)),
                    // next_mail_date: new Date(currentDate.setHours(currentDate.getHours() + 24)),
                    count: 1,
                });
            }
        } else if (!existsJobSchedule) {
            schedule.scheduledJobs[scheduleName].cancel();
        }
    });
};

const restartScheduler = async () => {
    const findSchedulers = await schedulerService.getRunningSchedulerList({
        is_profile_completed: false,
        next_mail_date: { $ne: null },
    });

    if (findSchedulers.length) {
        for (const scheduler of findSchedulers) {
            await startScheduler(scheduler._id, scheduler.next_mail_date);
        }
    }
};

module.exports = {
    // mailJob,
    startScheduler,
    restartScheduler,
};
