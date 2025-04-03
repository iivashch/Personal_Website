# Personal Blog Website

Written with Express, EJS, Javascript, Docker, and deployed using AWS.

AWS:

* https://console.aws.amazon.com/lambda/
* https://console.aws.amazon.com/apigateway/
* https://console.aws.amazon.com/cloudformation/
* https://aws.amazon.com/route53/



To Deploy use ``` serverless deploy ```

AWS Sevices:

Service	Free Tier Limit
Lambda	1M requests/month + 400,000 GB-seconds/month
API Gateway	1M HTTP API calls/month
S3	5 GB storage, 20k GET, 2k PUT/month
DynamoDB	25 GB storage, 25 RCU + 25 WCU
CloudWatch	10 custom metrics, 5 alarms/month
Route 53	❌ Not free — each hosted zone = $0.50/mo