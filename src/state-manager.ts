import { AccountContext } from "../context/AccountContext";
import accountStateMachine from "../machines/account-machine"
//import {RedisCache} from "./RedisCache";
import { createClient } from 'redis'

var redisClient;
//  = new RedisCache({
//     host: 'dv-dryden', port: '26379', prefix: 'accountState'

//   });

const basekp="refunds-state-machine.";
const statekp="state."

async function connectClient() {
  const client = createClient({ url: "redis://localhost:26379" });
  await client.connect();
  return client;
}
async function retrieveState(userId) {
  if (!redisClient ) { redisClient = await connectClient(); }

  const myKeyValue = await redisClient.json.get(basekp + statekp + userId, { path: "$." });
  console.log(myKeyValue);
  return myKeyValue;

}

async function getContext(userId): Promise<AccountContext> {
  if (!redisClient) { redisClient = await connectClient(); }
  return await redisClient.json.get(basekp + statekp + userId, { path: ".context" });

}





async function persistState(userId, value) {
  // get connection
  if (!redisClient) { redisClient = await connectClient(); }
  await redisClient.json.set(basekp+statekp + userId, "$.", value);
  await redisClient.json.set(basekp + "global.stateMap", "$." + userId, value);
}


async function handleEvent(userId, event) {
  //get previous state
 /* var previousState = await getState(userId,);
  var previousContext = await getContext(userId);
  var actualState = accountStateMachine.transition(previousState, event, previousContext);
  await setState(userId, actualState);
  return actualState;*/
}
export {  getContext, retrieveState , persistState }