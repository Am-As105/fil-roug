<?php

$API_KEY = "057deb0484ab7429d7909f992f348e6b-311042ff-5826-45df-8629-714a2f6b5bab";
$BASE_URL = "https://2yxr6z.api.infobip.com";
$TO = "+212612013501";

$data = [
    "messages" => [
        [
            "destinations" => [
                ["to" => $TO]
            ],
            "from" => "InfoSMS",
            "text" => "TEST SMS OK"
        ]
    ]
];


$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $BASE_URL . "/sms/3/messages",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER => [
        "Authorization: App $API_KEY",
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode($data),
]);

$response = curl_exec($ch);
$error = curl_error($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

echo "<pre>";
echo "STATUS: " . $status . "\n\n";

if ($error) {
    echo "CURL ERROR:\n" . $error;
} else {
    echo "RESPONSE:\n" . $response;
}
var_dump($status);
var_dump($response);
var_dump($error);
exit;
echo "</pre>";