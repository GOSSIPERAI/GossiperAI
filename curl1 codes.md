curl -H "authorization: $ASSEMBLYAI_API_KEY" \
     https://api.assemblyai.com/v2/transcript/<JOB_ID>


//////////////////////////////////////
 $apiKey = "c46e668e28ac4bc292d2e0c6d144498f"
>> $jobId = "287605f3-5fe8-4f0a-9d71-0c797080f31e"
>>
>> Invoke-RestMethod `
>>   -Uri "https://api.assemblyai.com/v2/transcript/$jobId" `
>>   -Headers @{ authorization = $apiKey } `
>>   -Method Get
>>

 curl -H "authorization: $c46e668e28ac4bc292d2e0c6d144498f" \
>>      https://api.assemblyai.com/v2/transcript/<287605f3-5fe8-4f0a-9d71-0c797080f31e>
>>