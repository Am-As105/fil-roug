<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send($to, $message)
    {
        try {
            $client = new Client(
                config('services.twilio.sid'),
                config('services.twilio.token')
            );

            $client->messages->create($to, [
                'from' => config('services.twilio.from'),
                'body' => $message,
            ]);

        } catch (\Throwable $e) {
            Log::error('SMS failed: ' . $e->getMessage());
        }
    }
}