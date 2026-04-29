<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Services\SmsService;

class CatastropheController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Catastrophe::with('type')->latest()->get()
        ]);
    }

    public function show($id)
    {
        $catastrophe = Catastrophe::with('type')->find($id);

        if (!$catastrophe) {
            return response()->json([
                'success' => false,
                'message' => 'Not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $catastrophe
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'date' => 'required|date',
                'severity' => 'required|string|max:255',
                'status' => 'required|string|max:255',
                'type_id' => 'required|exists:types,id',
                'victims' => 'nullable|integer',
                'injured' => 'nullable|integer',
                'damage' => 'nullable|numeric',
            ]);

            $catastrophe = Catastrophe::create($validated);

            try {
                $usersEmail = User::whereNotNull('email')->get();
                foreach ($usersEmail as $user) {
                    Mail::html("
                        <h2>Nouvelle catastrophe</h2>
                        <p><strong>Titre:</strong> {$catastrophe->title}</p>
                        <p><strong>Description:</strong> {$catastrophe->description}</p>
                        <p><strong>Date:</strong> {$catastrophe->date}</p>
                        <p><strong>Gravité:</strong> {$catastrophe->severity}</p>
                        <p><strong>Status:</strong> {$catastrophe->status}</p>
                        <p><strong>Latitude:</strong> {$catastrophe->latitude}</p>
                        <p><strong>Longitude:</strong> {$catastrophe->longitude}</p>
                        <p><strong>Victimes:</strong> {$catastrophe->victims}</p>
                        <p><strong>Blessés:</strong> {$catastrophe->injured}</p>
                        <p><strong>Dégâts:</strong> {$catastrophe->damage} DH</p>
                        <br>
                        <a href='https://savehaven.aminearar.com/details.html?id={$catastrophe->id}'>
                            Voir plus de détails
                        </a>
                    ", function ($message) use ($user) {
                        $message->to($user->email)
                                ->subject("Nouvelle Catastrophe");
                    });
                }
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }

            try {
                $sms = new SmsService();
                $usersPhone = User::whereNotNull('telephone')->get();

                foreach ($usersPhone as $user) {
                    $sms->send(
                        $user->telephone,
                        "Nouvelle catastrophe: {$catastrophe->title}"
                    );
                }
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Catastrophe created successfully',
                'data' => $catastrophe
            ], 201);

        } catch (\Throwable $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $catastrophe = Catastrophe::find($id);

            if (!$catastrophe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not found'
                ], 404);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string',
                'latitude' => 'sometimes|numeric',
                'longitude' => 'sometimes|numeric',
                'date' => 'sometimes|date',
                'severity' => 'sometimes|string|max:255',
                'status' => 'sometimes|string|max:255',
                'type_id' => 'sometimes|exists:types,id',
                'victims' => 'sometimes|nullable|integer',
                'injured' => 'sometimes|nullable|integer',
                'damage' => 'sometimes|nullable|numeric',
            ]);

            $catastrophe->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Updated successfully',
                'data' => $catastrophe->fresh('type')
            ]);

        } catch (\Throwable $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }

    public function delete(Request $request, $id)
    {
        try {
            $catastrophe = Catastrophe::find($id);

            if (!$catastrophe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not found'
                ], 404);
            }

            $catastrophe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully'
            ]); 

        } catch (\Throwable $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }
}