<?php

// namespace App\Services;

// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;

// class SmsService
// {
//     public function send($message)
//     {
//         try {
//             Log::info("SMS START");

//             $response = Http::timeout(10)->withHeaders([
//                 'Authorization' => 'App ' . env('INFOBIP_API_KEY'),
//                 'Content-Type' => 'application/json',
//             ])->post(env('INFOBIP_BASE_URL') . '/sms/3/messages', [
//                 "messages" => [
//                     [
//                         "destinations" => [
//                             ["to" => env('INFOBIP_TO')]
//                         ],
//                         "from" => "447491163443",
//                         "text" => $message
//                     ]
//                 ]
//             ]);

//             Log::info("SMS RESPONSE", [
//                 'status' => $response->status(),
//                 'body' => $response->body()
//             ]);

//         } catch (\Throwable $e) {
//             Log::error("SMS ERROR: " . $e->getMessage());
//         }
//     }
// }