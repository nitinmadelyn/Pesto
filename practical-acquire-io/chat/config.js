module.exports = {
   "apiEndPoint": "http://localhost:3000/",
   "port": 8080,
   "secret": "exyAU0cwm2wsEqyG3Y3F",
   "tokenLife": 30*86400,
   "refreshTokenLife": 2592000,
   "region": process.env.region || "ap-south-1",
   "endpoint": "http://localhost:8000",
   "stage": process.env.stage || "dev",
   "esEndpoint": process.env.esEndpoint || "https://search-web-jobsquare-p36ccs4f6x4uxp6ldn47mckjr4.ap-south-1.es.amazonaws.com",
   "S3Bucket": "dev-assets.jobsquare.com",
   "CloudFront": "https://dev-assets.jobsquare.com/",
   "signedUrlExpireSeconds": 60 * 5,
   "sqsResource": process.env.sqsResource || "https://sqs.ap-south-1.amazonaws.com/923642526244/dev-jobsquare",
   "replyEmailAddress": process.env.replyEmailAddress || "social@jobsquare.com",
   "sourceEmailAddress": process.env.sourceEmailAddress || "bot@jobsquare.com",
   "rootPath": process.env.rootPath || "https://dev.jobsquare.com",
   "FCMKEY": process.env.FCMKEY || "AAAA2qmb8Hw:APA91bGZhVtYKm7mZ2eMRCA69mBQo3A-hlXFEQTnLaADNWs8d5XnDwcoQNcVhkTeUD1eJ84YKeCSD24X2HXRoSBDcNqw-iLXqKx7IrK_T1y3tUmenvPd3LoHh5y5Eg4Ms6VmF4w5M99Z"
}