import {nanoid} from "nanoid";

const fetch = global.fetch; // Node 18+

const URL = "http://localhost:8080/v1/jobs";


const body = {
    tenant_id: "t_123",
    type: "webhook.dispatch",
    payload: {order_id: 42, status: "paid"},
    destination: {
        url: "http://localhost:8080/v1/jobs?tenant_id=t_123&limit=5",
        method: "GET",
        headers: {"X-Signature": "..."},
        timeout_ms: 5000
    },
    dedupe_key: "",
    execute_at: "2026-02-02T12:00:00Z",
    retry: {
        max_attempts: 8,
        base_delay_ms: 500,
        max_delay_ms: 30000
    },
    rate_limit: {
        rps: 5,
        burst: 10
    }
};

async function sendRequest() {
    try {

        body.dedupe_key = nanoid();
        return fetch(URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
    } catch (e) {
        if(e instanceof Error) {
            console.error(e.message);
        }else{
            console.error('Unknown error occurred');
        }
    }
}

async function stressTest(totalRequests = 1000, concurrency = 100) {
    const batches = Math.ceil(totalRequests / concurrency);

    console.log(`Starting stress test...`);

    for (let i = 0; i < batches; i++) {
       try{
           const promises = [];

           for (let j = 0; j < concurrency; j++) {
               promises.push(sendRequest());
           }

           await Promise.all(promises);
           console.log(`Batch ${i + 1}/${batches} done`);
       } catch (e) {
           if(e instanceof Error) {
               console.error(e.message);
           }else{
               console.error('Unknown error occurred');
           }
       }
    }

    console.log("Stress test completed");
}

stressTest(5000, 100);
