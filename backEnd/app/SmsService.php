<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send($to = null, $message = '')
    {
        try {
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $from = config('services.twilio.from');

            $to = $this->normalize($to ?: config('services.twilio.to'));
            $from = $this->normalize($from);

            if (!$sid || !$token || !$from || !$to || !$message) {
                return;
            }

            $client = new Client($sid, $token);

            $client->messages->create($to, [
                'from' => $from,
                'body' => $message,
            ]);
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
        }
    }

    private function normalize($phone)
    {
        $phone = trim((string) $phone);

        if ($phone === '') {
            return null;
        }

        $phone = preg_replace('/[\s\-\.\(\)]/', '', $phone);

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        if (str_starts_with($phone, '00')) {
            return '+' . substr($phone, 2);
        }

        if (preg_match('/^0[5-7]\d{8}$/', $phone)) {
            return '+212' . substr($phone, 1);
        }

        if (preg_match('/^212[5-7]\d{8}$/', $phone)) {
            return '+' . $phone;
        }

        return $phone;
    }
}