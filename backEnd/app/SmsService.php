<?php


    
use Illuminate\Support\Facades\Http;

class SmsService
{
    public function send()
    {
        return Http::withHeaders([
            'Authorization' => 'App ' . env('INFOBIP_API_KEY'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post(env('INFOBIP_BASE_URL') . '/sms/3/messages', [
            "messages" => [
                [
                    "destinations" => [
                        ["to" => "+212612013501"]
                    ],
                    "from" => "InfoSMS",
                    "text" => "Test SMS"
                ]
            ]
        ]);
    }
}