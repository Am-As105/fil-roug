<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send($message)
    {
        try {
            Http::withHeaders([
                'Authorization' => 'App ' . env('INFOBIP_API_KEY'),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(env('INFOBIP_BASE_URL') . '/sms/3/messages', [
                "messages" => [
                    [
                        "destinations" => [
                            ["to" => env('INFOBIP_TO')]
                        ],
                        "from" => "ServiceSMS",
                        "text" => $message
                    ]
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('SMS failed: ' . $e->getMessage());
        }
    }
}