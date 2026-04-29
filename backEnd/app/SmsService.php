<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SmsService
{
    public function send($phone, $message)
    {
        return Http::withHeaders([
            'Authorization' => 'App ' . env('INFOBIP_API_KEY'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ])->post(env('INFOBIP_BASE_URL') . '/sms/3/messages', [
            "messages" => [
                [
                    "destinations" => [
                        ["to" => $phone]
                    ],
                    "from" => "ServiceSMS",
                    "text" => $message
                ]
            ]
        ]);
    }
}