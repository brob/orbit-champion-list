const { schedule } = require('@netlify/functions')

// To learn about scheduled functions and supported cron extensions,
// see: https://ntl.fyi/sched-func
module.exports.handler = schedule('0 0 * * *', async (event) => {
  const eventBody = JSON.parse(event.body)
  console.log(`Next function run at ${eventBody.next_run}.`)
  await fetch('https://api.netlify.com/build_hooks/6233a1c54589f61c9ccb8534', { method: 'POST'});

  return {
      statusCode: 200,
  };
})
