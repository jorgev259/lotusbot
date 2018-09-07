const axios = require('axios')

async function run () {
  // let param = ['report', 'chito123664']

  let player = (await axios.get(`https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/chito123664`, {headers: {'X-API-Key': '1aa7b2df585f4095acfaa4bef2abcc8a'}})).data.Response
  let profile = (await axios.get(`https://www.bungie.net/Platform/Destiny2/${player[0].membershipType}/Profile/${player[0].membershipId}/?components=100`, {headers: {'X-API-Key': '1aa7b2df585f4095acfaa4bef2abcc8a'}})).data.Response.profile.data
  let promise
  let actList={}
  profile.characterIds.forEach(async charId => {
    let activities = (await axios.get(`https://www.bungie.net/Platform/Destiny2/${player[0].membershipType}/Account/${player[0].membershipId}/Character/${charId}/Stats/Activities/?mode=4`, {headers: {'X-API-Key': '1aa7b2df585f4095acfaa4bef2abcc8a'}})).data.Response.activities

    actList[charId] = activities.map(async activity => {
      let actInfo = (await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/DestinyActivityDefinition/${activity.activityDetails.referenceId}/`, {headers: {'X-API-Key': '1aa7b2df585f4095acfaa4bef2abcc8a'}})).data.Response
      return {
        'period': activity.period,
        'completed': activity.values.completed.statId,
        'raid': actInfo.displayProperties.name,
        'tier': actInfo.tier
      }
    })
  })
}
run()
