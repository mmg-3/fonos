// Bucket policy - GET requests on "storageBucket" bucket will not need authentication.
module.exports = bucket => `
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "s3:GetBucketLocation",
          "s3:ListBucket"
        ],
        "Effect": "Allow",
        "Principal": {
          "AWS": [
            "*"
          ]
        },
        "Resource": [
          "arn:aws:s3:::${bucket}"
        ],
        "Sid": ""
      },
      {
        "Action": [
          "s3:GetObject"
        ],
        "Effect": "Allow",
        "Principal": {
          "AWS": [
            "*"
          ]
        },
        "Resource": [
          "arn:aws:s3:::${bucket}/*"
        ],
        "Sid": ""
      }
    ]
  }
  `
//# sourceMappingURL=bucket_policy.js.map
