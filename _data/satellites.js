const fetch = require('node-fetch').default;
require('dotenv').config();
const today = new Date();
const startDate = new Date(new Date().setDate(today.getDate() - 30));
const options = {
    method: 'GET',
    headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`
    }
};



//recursive function to get all data from paginated api
async function getAllData(url, collector = []) {

    let response = await fetch(url, options);
    let data = await response.json();
    console.log(data)
    collector.push(...data.data);

    if (data.links.next) {
        await getAllData(data.links.next, collector);
    }

    return collector;
}



// get member ids from orbit api by tag satellite:2022
async function getMembers() {
    const url = `https://app.orbit.love/api/v1/${process.env.WORKSPACE_ID}/members?member_tags=Satellite%3A2022`
    const response = await getAllData(url);

    const members = response.map(member => ({ 
        id: member.id, 
        name: member.attributes.name,
        url: member.attributes.orbit_url,
        avatar: member.attributes.avatar_url 
    }));

    return members;

}



function collectWeights(activities) {
    const activityWeights = activities.map(activity => parseFloat(activity.attributes.weight))
    const total = activityWeights.reduce((a, b) => a + b, 0)
    return total;
}



// recursive function to get all activities if there is a next page
async function getAllActivities(id, startDate) {
    // get user from orbit api
    const activities = await getAllData(`https://app.orbit.love/api/v1/${process.env.WORKSPACE_ID}/activities?start_date=${startDate}&member_id=${id}&items=100`);

    return activities
}
module.exports = async () => {

    const members = await getMembers();
    // map over members, get their activities and create an array of weights and userids
    const weights = await Promise.all(members.map(async member => {
        const activities = await getAllActivities(member.id, startDate);
        const total = collectWeights(activities)
        return {
            ...member,
            weight: total,
            count: activities.length
        }
    })
    )
    const sorted = weights.sort((a, b) => b.weight - a.weight)
    const totalActivites = weights.reduce((a, b) => a + b.count, 0)
    const totalWeight = weights.reduce((a, b) => a + b.weight, 0)
    const averageWeight = parseFloat(totalWeight / totalActivites).toFixed(2)
    console.log(sorted);
    return {
        members: sorted,
        totalActivites,
        totalWeight,
        averageWeight
    };
}