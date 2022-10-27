
import { createMachine, sendParent, actions, assign, } from 'xstate';
import { mapContext } from "xstate/lib/utils";
import { interpret } from 'xstate';
import { inspect } from '@xstate/inspect';

const MILLISECONDS_PER_DAY = 86400 * 1000;
interface Context {
    retries: number;
}

// const check_limits = (context, event) => new Promise((resolve, reject) => {
//     refund_processing_limits.forEach((limit) => {
//         var limitResult = limit.test(event.transaction.amount);
//         if (!limitResult.isSuccess)
//             return reject(limitResult.requiresApproval);
//     });
//     return resolve(true);
// });
const refundsStateMachine =

    /** @xstate-layout N4IgpgJg5mDOIC5QCcwDMCuA7CA6AhgMYDWWA9gO4A2kMEAxAEoCiAYgKoByAIgPoAKyMoTixIAbQAMAXUSgADmVgBLAC7KyWOSAAeiAIwA2AEwBmXAE4AHAHYrhqwBZH+yaYCsNgDQgAnohMLXH0bQ1NjQ0N3YxsbSWMAXwSfVEwcAhJyalpIJjYuPlZ8ZRoIKVkkEEUVdU1tPQQjM0tbeycXN08ffwR3U0lcZ0MbU0crUw8IxySU9Gw8VPneVABHDDhVXIhNMFxlLAA3MmJd+SERWFheKmUAWzVYcu1qtQ0tSobR-VwbaM9jcYWGzGCwhbqIYzuIJRdxWCyeSQjfRmGwzECLdIYiDLMBrDa5MDIITIXDyKj4VRoMjIW6k86ia53B5PSovWrvUCfFw-P7AwHA0HePyIKzGFr9Gz6az6KzxGzTZLoubpPHrbFU5C8fDyM5kA74Kh5Dg8XgAYQAgpxTcwADI25jcFkKJSvOofAyudyDCyGSSGRyS4yuKLghDhQy4TzyqGSv0OUZorG4VWQXgarU6oT6w3m-j8RgAeQAauabbxc-niw6nVUXez6h7JF7HD6-QHkcH3KH-UEBeFge5PVZ9InlXgU+rqRnddn6AAVACSAFkHQX2HOa2y3g3Gp7vb7-YHO6HTHZI44m5LTFLxvp3ArZmlx+s1Wmp9qZwb6BXCyWy9xmE4BdqxkZ4623d1dybfc2yPP0u2FBBjBiXAnDsYY4X0RxjEcQxRyfZMX1TdMPyzL8f2LUtyzzX8HXLE0bWXBc514FgAGVmA3UDWXAt1OUbZtW0PDt4NDaJzGQqVrHhKw4TMfD5kIsBXxIzM9S-TdeI5XQBJg4Sg1ExCAxsXAYkkIxr1MCxEXvJJFXICA4G0JMiFIShSjoMCagg-jGlw8w4WcaxhilKzDDE31xQiX0pRbRx3AUzEx14chVF4QgyFuMkwE2CAvNdbSGhlUwI0kFt3F9CqLBifQTwiSNhgDeEcNGexEoWZLVnWWBcvy+tIOw0MgUjEEAVkmI4gcEdFSTCc301Uj1KoPqfJ0hA4m+Qdh2sxEA2QoUekhcxHAmOEohOg9rHaulhFESAVr4tbitK8rKsMarJW7aJzyE0UZTcRIZrHB7CsQABacLEIhuyEiAA */
    createMachine(
        {
  context: {
    refund_details: {
      transaction_id: 0,
      amount: 0.0,
      currency: "USD",
      user_id: 0,
      purchase_date: null,
      refund_requested_date: null,
    },
    submitted_by: { name: null, id: null },
    assigned_limits: [],
    ruleset: "default",
    evaluated_limits: [],
    status: "unknown",
    approval: { status: null, reviewed_by: null },
    evaluated_time: new Date().getTime(),
  },
  id: "refund",
  initial: "refund_requested",
  states: {
    acknowledged: {
      on: {
        REFUND_Processed: {
          target: "processed",
          actions: "update_status",
        },
        REFUND_Failed: {
          target: "refund_not_completed",
          actions: assign({ status: (_, event) => event.type }),
        },
      },
    },
    refund_not_completed: {
      type: "final",
    },
    refund_requested: {
      invoke: {
        src: "check_limits",
        id: "process_limits",
        onDone: [
          {
            target: "queued_for_approval",
            cond: "requires_approval",
            actions: [
              "update",
              assign({
                evaluated_limits: (_, event) => event.type,
              }),
            ],
          },
        ],
        onError: [
          {
            target: "refund_not_completed",
            actions: "reject",
          },
        ],
      },
    },
    queued_for_approval: {
      description:
        "If required, ensure refund request is permitted. Retain request until approval is provided where necessary",
      always: {
        target: "acknowledged",
        cond: "already_approved_or_not_required",
      },
      on: {
        REFUND_CANCELLED: {
          target: "refund_not_completed",
        },
        APPROVAL_APPROVED: {
          target: "acknowledged",
          actions: "record_approval",
        },
        TIMEDOUT: {
          target: "refund_not_completed",
          actions: assign({ status: (_, event) => event.type }),
        },
        APPROVAL_DENIED: {
          target: "refund_not_completed",
          actions: "record_approval",
        },
        APPROVAL_APPROVED_AND_LIMIT_RESET: {
          target: "acknowledged",
          actions: ["reset_limit", "record_approval"],
        },
      },
    },
    processed: {
      type: "final",
    },
  },
},

        {
            guards: {
                already_approved_or_not_required: (context, event) => {return event.approval && event.approval.status && event.approval.status == "approved" },
                requires_approval: (context, event) => {return context.evaluated_time>0 && context.evaluated_limits.every((limit)=> limit.test(context))},
            },
            actions: {
                reset_limit: (context,event)=>{return "nothing";},
                    // this is a tough one, would have to reset the counters associated with the user state, not this refund. Reseting a user could be tough to execute rationally
                    //if (context.ruleset == "default") context.assigned_limits = default_limits; else throw new Error("unknown ruleset " + context.ruleset) 
                
                update: (context, event) => { context.assigned_limits.forEach(limit => limit.update(event)) },
                update_status: (context, event) => { context.status = event.status },
                record_approval: (context, event) => { context.status = event.result; context.approval.status = event.approval_status; context.approval.reviewed_by = event.reviewer },
                add_to_pending_amounts_counter: (context, event) => 0, // this is a counter that needs to track the current value of unprocessed refunds per user
                remove_from_pending_amounts_counter: (context, event) => 0 // once refund is processed we need to remove from this counter 
            },
            services: {
                check_limits: (context, event) => new Promise((resolve, reject) => 
                {
                 // await redisClient.get("refunds.agents." + userId + ".confirmed.counters.total");
                       var limitResults =  context.assigned_limits.map((limit) => limit.test(context.refund_details, context.submitted_by));
                           
                        
                            if (limitResults.some(d=> d.isInstantFail))
                               return reject(limitResults);
                       return resolve(limitResults);
                    })
               // ,
                // update_per_agent_data: () => {return
                //     new Promise<string>((resolve, reject) => {
                //         // store to redis  //
                //     return resolve("ooo");});
                // }
            }, devtools:true

        }
        );

const refund_processing_limits = [];
const default_limits = [];

export { refundsStateMachine};