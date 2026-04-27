<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send($message)
    {
        try {
            return Http::withHeaders([
                'Authorization' => 'App ' . config('services.infobip.key'),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ])->post(config('services.infobip.base_url') . '/sms/3/messages', [
                "messages" => [
                    [
                        "destinations" => [
                            ["to" => config('services.infobip.to')]
                        ],
                        "from" => "InfoSMS",
                        "text" => $message
                    ]
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('SMS error: ' . $e->getMessage());
        }
    }
}