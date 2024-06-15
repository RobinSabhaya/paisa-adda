const ApiError = require('../utils/apiError');
const fetch = require('node-fetch');
const { google } = require('googleapis');
const config = require('../config/config');
const axios = require('axios');
const moment = require('moment');

/**
 * Get instagram data
 * @param {string} userName
 * @returns
 */
const instagramData = async (userName) => {
    try {
        const myHeaders = new fetch.Headers();
        myHeaders.append(
            'User-Agent',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)'
        );
        myHeaders.append(
            'Cookie',
            'csrftoken=aIYfw8FBLZQF091uY6l20HzFMMYIJssR; ig_did=623BFC6E-AC6D-4C4B-8261-F98C533CA3A2; mid=ZfkmGgAAAAFtgwLwfiM51ujbw0sv; csrftoken=VJOeXjreVIr8e7gKUhPoy5vsLuKAvYDq; ig_did=B76FB6AA-44FF-4CF0-8B67-FD22EEAC54D5; ig_nrcb=1; mid=Zg6UoAAEAAETVt79DI8z6wdYsD-1'
        );

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
        };

        let response = await fetch(
            `https://www.instagram.com/api/v1/users/web_profile_info/?username=${userName}`,
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => JSON.parse(result))
            .catch((error) => error);

        let commonDetails = {
            followers: response?.data?.user?.edge_followed_by?.count || 0,
            following: response?.data?.user?.edge_follow?.count || 0,
            full_name: response?.data?.user?.full_name,
            posts: response?.data?.user?.edge_owner_to_timeline_media?.count || 0,
            engagement: 0,
        };

        let last_4_week = {
            likes: 0,
            comments: 0,
            posts: 0,
            engagement: 0,
        };

        const currentUnixTime = moment().unix();

        let posts = response?.data?.user?.edge_owner_to_timeline_media?.edges || [];

        let likes = 0;
        let comments = 0;

        let seconds_in_28_days = 28 * 24 * 60 * 60;

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i].node;

            comments += post.edge_media_to_comment.count;
            likes += post.edge_liked_by.count;

            let difference = currentUnixTime - post.taken_at_timestamp;
            if (seconds_in_28_days >= difference) {
                last_4_week.likes += post.edge_liked_by.count;
                last_4_week.comments += post.edge_media_to_comment.count;
                last_4_week.posts += 1;
            }
        }

        let avgLikes = Math.ceil(likes / posts.length) || 0;
        let avgComments = Math.ceil(comments / posts.length) || 0;
        const engagement = (((avgComments + avgLikes) / commonDetails.followers) * 100).toFixed(2);

        /** Calculate last 4 week engagement rate */
        const avg4WeekLikes = Math.ceil(last_4_week.likes / last_4_week.posts) || 0;
        const avg4WeekComments = Math.ceil(last_4_week.comments / last_4_week.posts) || 0;
        last_4_week.engagement =
            Number(
                (((avg4WeekComments + avg4WeekLikes) / commonDetails.followers) * 100).toFixed(2)
            ) || 0;

        return {
            ...commonDetails,
            engagement: Number(engagement) || 0,
            last_4_week,
        };
    } catch (error) {
        throw new ApiError(
            400,
            error?.message + ' | [From Instagram]' ||
                'Something went wrong to get metrics of instagram.'
        );
    }
};

const instagramDataV2 = async (userName) => {
    try {
        // const myHeaders = new fetch.Headers();
        // myHeaders.append(
        //     'User-Agent',
        //     'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)'
        // );
        // myHeaders.append(
        //     'Cookie',
        //     'csrftoken=aIYfw8FBLZQF091uY6l20HzFMMYIJssR; ig_did=623BFC6E-AC6D-4C4B-8261-F98C533CA3A2; mid=ZfkmGgAAAAFtgwLwfiM51ujbw0sv; csrftoken=VJOeXjreVIr8e7gKUhPoy5vsLuKAvYDq; ig_did=B76FB6AA-44FF-4CF0-8B67-FD22EEAC54D5; ig_nrcb=1; mid=Zg6UoAAEAAETVt79DI8z6wdYsD-1'
        // );

        // const requestOptions = {
        //     method: 'GET',
        //     headers: myHeaders,
        //     redirect: 'follow',
        //     agent: new HttpProxyAgent('http://157.240.237.174:443'),
        // };

        // const axios = require("axios");
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://instagram.com/api/v1/users/web_profile_info/?username=${userName}`,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)',
                Cookie: 'csrftoken=UlsFK0mVzfAAW3Z1yauo0xV5HQ96VspV; ig_did=E2357424-7B2A-4A67-8959-65B8F983AB27; ig_nrcb=1; mid=ZjX2QwAEAAHEtYAWZJ9eOtJtVIrE',
            },
        };

        let { data: response } = await axios.request(config);

        let commonDetails = {
            followers: response?.data?.user?.edge_followed_by?.count || 0,
            following: response?.data?.user?.edge_follow?.count || 0,
            full_name: response?.data?.user?.full_name,
            posts: response?.data?.user?.edge_owner_to_timeline_media?.count || 0,
            engagement: 0,
        };

        let posts = response?.data?.user?.edge_owner_to_timeline_media?.edges || [];

        let likes = 0;
        let comments = 0;

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i].node;

            comments += post.edge_media_to_comment.count;
            likes += post.edge_liked_by.count;
        }

        let avgLikes = Math.ceil(likes / posts.length) || 0;
        let avgComments = Math.ceil(comments / posts.length) || 0;
        const engagement = (((avgComments + avgLikes) / commonDetails.followers) * 100).toFixed(2);

        return {
            ...commonDetails,
            engagement: Number(engagement) || 0,
        };
    } catch (error) {
        throw new ApiError(
            400,
            error?.message + ' | [From Instagram]' ||
                'Something went wrong to get metrics of instagram.'
        );
    }
};

/**
 * Get youtube data
 * @param {string} channelHandleName
 * @returns
 */
const youtubeData = async (channelHandleName) => {
    try {
        // Create a YouTube Data API client
        const youtube = google.youtube({
            version: 'v3',
            auth: config.google.youtube.api_key,
        });

        const response = await youtube.channels.list({
            part: 'statistics,snippet',
            forHandle: channelHandleName,
        });

        const channel = response.data.items[0];
        const statistics = channel.statistics;
        const snippet = channel.snippet;
        let nextPageToken = null;

        let totalVideos = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let last_4_week = {
            likes: 0,
            comments: 0,
            videos: 0,
            engagement: 0,
        };

        const threeMonthAgo = new Date(new Date().getTime() - 84 * 24 * 60 * 60 * 1000); // Get Date of three months(84 days) ago
        const oneMonthAgo = new Date(new Date().getTime() - 28 * 24 * 60 * 60 * 1000); // Get Date of one month(28 days) ago

        do {
            // Fetching video details for calculating engagement rate
            const videosResponse = await youtube.search.list({
                part: 'snippet',
                channelId: channel.id,
                publishedAfter: threeMonthAgo,
                maxResults: 4, // Adjust as needed
                order: 'date', // order: "date", // Order by date, you can change it to relevance or viewCount etc.
                type: 'video',
                pageToken: nextPageToken,
            });

            totalVideos += videosResponse.data.items.length;

            let videoIds = videosResponse.data.items.map((video) => video.id.videoId).join(',');

            if (videoIds.length) {
                // Fetching statistics and snippet for videos
                const videoStatsResponse = await youtube.videos.list({
                    part: 'statistics,snippet',
                    id: videoIds,
                });

                for (let i = 0; i < videoStatsResponse.data.items.length; i++) {
                    const video = videoStatsResponse.data.items[i];

                    totalLikes += parseInt(video.statistics.likeCount || 0);
                    totalComments += parseInt(video.statistics.commentCount || 0);

                    if (new Date(video.snippet.publishedAt) >= oneMonthAgo) {
                        last_4_week.likes += parseInt(video.statistics.likeCount || 0);
                        last_4_week.comments += parseInt(video.statistics.commentCount || 0);
                        last_4_week.videos += 1;
                    }
                }
            }

            nextPageToken = videosResponse.data.nextPageToken;
        } while (nextPageToken);

        /** Calculate average like and comments */
        const avgLikes = Math.ceil(totalLikes / totalVideos);
        const avgComments = Math.ceil(totalComments / totalVideos);
        /** Calculate engagement rate */
        const engagement = (((avgLikes + avgComments) / statistics.subscriberCount) * 100).toFixed(
            2
        );

        /** Calculate average like and comments of last 4 week videos */
        const avg4WeekLikes = Math.ceil(last_4_week.likes / last_4_week.videos);
        const avg4WeekComments = Math.ceil(last_4_week.comments / last_4_week.videos);
        /** Calculate engagement rate of last 4 week videos */
        last_4_week.engagement =
            Number(
                (((avg4WeekLikes + avg4WeekComments) / statistics.subscriberCount) * 100).toFixed(2)
            ) || 0;

        return {
            channel_id: channel.id,
            channel_title: snippet.title,
            subscribers: statistics.subscriberCount,
            videos: statistics.videoCount,
            engagement: Number(engagement) || 0,
            last_4_week,
        };
    } catch (error) {
        throw new ApiError(
            400,
            error?.message + ' | [From Youtube]' ||
                'Something went wrong in getMetricsOfYoutube API.'
        );
    }
};

module.exports = { instagramData, instagramDataV2, youtubeData };
