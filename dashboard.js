const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Dashboard HTML with dark theme
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partners Bots Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #1e1e1e;
            color: #ffffff;
            line-height: 1.6;
            min-height: 100vh;
        }

        .top-header {
            background-color: #2d2d2d;
            border-bottom: 1px solid #3d3d3d;
            padding: 1rem;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo-text {
            font-size: 1.2rem;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .logo-highlight {
            color: #4a90e2;
            font-weight: 700;
        }

        .button-container {
            display: flex;
            gap: 0.75rem;
            align-items: center;
        }

        .btn {
            background-color: #333333;
            border: 1px solid #4a90e2;
            color: #ffffff;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 28px;
            white-space: nowrap;
        }

        .btn:hover {
            background-color: #404040;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
        }

        .btn-primary {
            background-color: #4a90e2;
            border-color: #4a90e2;
            color: #ffffff;
            font-weight: 500;
        }

        .btn-primary:hover {
            background-color: #357abd;
            border-color: #357abd;
        }

        .main-content {
            margin-top: 100px;
            padding: 2rem 1rem;
        }

        @media (max-width: 600px) {
            .header-content {
                padding: 0.75rem;
            }

            .button-container {
                flex-wrap: wrap;
                justify-content: center;
            }

            .btn {
                padding: 0.4rem 0.8rem;
                min-width: 80px;
                font-size: 0.8rem;
            }

            .main-content {
                margin-top: 120px;
            }
        }

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.75);
            z-index: 1001;
            backdrop-filter: blur(4px);
        }

        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #2d2d2d;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 450px;
            z-index: 1002;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            padding: 0.75rem;
            border-bottom: 1px solid #3d3d3d;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background-color: #2d2d2d;
            z-index: 1;
        }

        .modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff;
        }

        .modal-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
        }

        .modal-close:hover {
            color: #ffffff;
        }

        .modal-body {
            padding: 0.75rem;
        }

        .form-group {
            margin-bottom: 0.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.2rem;
            color: #ffffff;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .form-input {
            width: 100%;
            padding: 0.4rem;
            background-color: #333333;
            border: 1px solid #4a4a4a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 0.8rem;
            transition: all 0.2s;
        }

        .form-input:focus {
            outline: none;
            border-color: #4a90e2;
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        textarea.form-input {
            min-height: 50px;
            resize: vertical;
        }

        .form-select {
            width: 100%;
            padding: 0.5rem;
            background-color: #333333;
            border: 1px solid #4a4a4a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 0.8rem;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23ffffff' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
        }

        .pricing-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.4rem;
            margin-bottom: 0.4rem;
        }

        .pricing-option {
            padding: 0.5rem;
            background-color: #333333;
            border: 1px solid #4a4a4a;
            border-radius: 4px;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
            font-size: 0.8rem;
        }

        .pricing-option:hover {
            border-color: #4a90e2;
        }

        .pricing-option.selected {
            background-color: #4a90e2;
            border-color: #4a90e2;
        }

        .file-upload {
            position: relative;
            width: 100%;
            height: 60px;
            border: 2px dashed #4a4a4a;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 0.4rem;
        }

        .file-upload:hover {
            border-color: #4a90e2;
        }

        .file-upload input {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .file-upload-text {
            color: #888;
            font-size: 0.75rem;
            text-align: center;
            padding: 0 0.5rem;
        }

        .file-upload-text div {
            font-size: 0.7rem;
            color: #888;
            margin-top: 0.2rem;
        }

        .file-upload-status {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(45, 45, 45, 0.95);
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 0.5rem;
        }

        .file-upload-status.show {
            display: flex;
        }

        .upload-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid #4a90e2;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }

        .upload-progress {
            font-size: 0.8rem;
            color: #4a90e2;
        }

        .upload-success {
            color: #00c853;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
        }

        .upload-error {
            color: #ff5252;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .modal-footer {
            padding: 0.75rem;
            border-top: 1px solid #3d3d3d;
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            position: sticky;
            bottom: 0;
            background-color: #2d2d2d;
            z-index: 1;
        }

        .btn-secondary {
            background-color: transparent;
            border-color: #4a4a4a;
        }

        .btn-secondary:hover {
            background-color: #404040;
            border-color: #4a4a4a;
        }

        .bot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            padding: 1rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .bot-card {
            background: linear-gradient(145deg, #2d2d2d, #333333);
            border-radius: 8px;
            padding: 1.25rem;
            position: relative;
            transition: transform 0.2s, box-shadow 0.2s;
            border: 1px solid #3d3d3d;
        }

        .bot-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .bot-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .bot-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff;
            margin: 0;
        }

        .bot-platform {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            background-color: #4a90e2;
            color: #ffffff;
        }

        .bot-description {
            color: #b0b0b0;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            cursor: pointer;
        }

        .description-more {
            color: #4a90e2;
            font-size: 0.8rem;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.25rem;
            background: none;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .description-more:hover {
            background-color: rgba(74, 144, 226, 0.1);
        }

        .description-more svg {
            transition: transform 0.2s ease;
        }

        .description-more:hover svg {
            transform: translateY(2px);
        }

        .description-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2d2d2d;
            border-radius: 8px;
            padding: 1.5rem;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            z-index: 1010;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .description-modal-content {
            max-height: calc(80vh - 100px);
            overflow-y: auto;
            padding-right: 0.5rem;
            margin-bottom: 1rem;
            color: #ffffff;
            line-height: 1.6;
        }

        .description-modal-content::-webkit-scrollbar {
            width: 6px;
        }

        .description-modal-content::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 3px;
        }

        .description-modal-content::-webkit-scrollbar-thumb {
            background: #4a90e2;
            border-radius: 3px;
        }

        .description-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .description-modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff;
        }

        .description-modal-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
            line-height: 1;
        }

        .description-modal-close:hover {
            color: #ffffff;
        }

        .modal-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            z-index: 1005;
            backdrop-filter: blur(4px);
        }

        .bot-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.8rem;
            color: #888;
        }

        .bot-owner {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: #888;
            margin-top: 0.5rem;
            padding: 0.4rem 0.5rem;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
        }

        .bot-owner svg {
            width: 10px;
            height: 10px;
            color: #888;
        }

        .bot-owner-name {
            font-weight: 500;
            color: #666;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .bot-owner-id {
            color: #888;
            font-size: 0.7rem;
        }

        .bot-price {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .bot-price.free {
            color: #00c853;
        }

        .bot-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #3d3d3d;
        }

        .bot-download {
            background-color: #4a90e2;
            color: #ffffff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.8rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: background-color 0.2s;
        }

        .bot-download:hover {
            background-color: #357abd;
        }

        .bot-tutorial {
            color: #4a90e2;
            text-decoration: none;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .bot-tutorial:hover {
            text-decoration: underline;
        }

        .bot-file {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: #888;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: rgba(74, 144, 226, 0.1);
            border-radius: 4px;
        }

        .bot-file svg {
            flex-shrink: 0;
            color: #4a90e2;
        }

        .bot-file-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .bot-type {
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            margin-top: 0.5rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
        }

        .bot-type span {
            opacity: 0.8;
        }

        .bot-type strong {
            opacity: 1;
            font-weight: 600;
        }

        .bot-type.dbot {
            background: rgba(74, 144, 226, 0.15);
            color: #4a90e2;
        }

        .bot-type.forex {
            background: rgba(46, 213, 115, 0.15);
            color: #2ed573;
        }

        .bot-type svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .mpesa-modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2d2d2d;
            border-radius: 8px;
            padding: 1.5rem;
            width: 90%;
            max-width: 400px;
            z-index: 1010;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .mpesa-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .mpesa-modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #ffffff;
        }

        .mpesa-modal-close {
            background: none;
            border: none;
            color: #888;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
            line-height: 1;
        }

        .mpesa-modal-close:hover {
            color: #ffffff;
        }

        .mpesa-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .mpesa-input {
            width: 100%;
            padding: 0.75rem;
            background-color: #333333;
            border: 1px solid #4a4a4a;
            border-radius: 4px;
            color: #ffffff;
            font-size: 0.9rem;
            transition: all 0.2s;
        }

        .mpesa-input:focus {
            outline: none;
            border-color: #4a90e2;
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .mpesa-submit {
            background-color: #00c853;
            color: #ffffff;
            border: none;
            padding: 0.75rem;
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .mpesa-submit:hover {
            background-color: #00a844;
        }

        .mpesa-price {
            text-align: center;
            font-size: 1.2rem;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <header class="top-header">
        <div class="header-content">
            <div class="header-top">
                <div class="logo">
                    <div class="logo-text">
                        <span class="logo-highlight">DFirst</span> Partners Bots
                    </div>
                </div>
            </div>
            <div class="button-container">
                <button class="btn btn-primary" id="addBotBtn">
                    + Add Bot
                </button>
                <button class="btn" id="derivBtn">
                    Deriv
                </button>
                <button class="btn" id="mtBtn">
                    MT4/MT5
                </button>
            </div>
        </div>
    </header>

    <main class="main-content">
        <div class="bot-grid">
            <!-- Bot cards will be added here dynamically -->
        </div>
    </main>

    <!-- Add Bot Modal -->
    <div class="modal-overlay" id="addBotModal">
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">Add New Bot</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addBotForm" onsubmit="handleSubmit(event)">
                    <div class="form-group">
                        <label class="form-label" for="botName">Bot Name</label>
                        <input type="text" id="botName" class="form-input" required placeholder="Enter bot name">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="description">Description</label>
                        <textarea id="description" class="form-input" required placeholder="Describe your bot's functionality"></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="platform">Platform</label>
                        <select id="platform" class="form-select" required onchange="updateFileTypes()">
                            <option value="">Select platform</option>
                            <option value="deriv">Deriv Bot</option>
                            <option value="mt">MT4/MT5</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Pricing</label>
                        <div class="pricing-options">
                            <div class="pricing-option" onclick="selectPricing('free')">Free</div>
                            <div class="pricing-option" onclick="selectPricing('paid')">Paid</div>
                        </div>
                        <input type="number" id="price" class="form-input" placeholder="Enter price" style="display: none;">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bot File</label>
                        <div class="file-upload">
                            <input type="file" id="botFile" required onchange="handleFileUpload(this)">
                            <div class="file-upload-text">
                                Drag & drop your bot file here or click to browse
                                <div style="font-size: 0.75rem; color: #888; margin-top: 0.25rem;">
                                    All file types supported
                                </div>
                            </div>
                            <div class="file-upload-status" id="uploadStatus">
                                <div class="upload-spinner"></div>
                                <div class="upload-progress">Uploading... <span id="uploadProgress">0%</span></div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="tutorialLink">Tutorial Video Link (YouTube)</label>
                        <input type="url" 
                               id="tutorialLink" 
                               class="form-input" 
                               placeholder="https://youtube.com/watch?v=..."
                               pattern="^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$"
                               title="Please enter a valid YouTube video URL">
                        <div style="font-size: 0.7rem; color: #888; margin-top: 0.25rem;">
                            Optional: Add a tutorial video to help users understand your bot
                        </div>
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="submitForm()">Add Bot</button>
            </div>
        </div>
    </div>

    <!-- Description Modal -->
    <div class="modal-backdrop" id="descriptionBackdrop"></div>
    <div class="description-modal" id="descriptionModal">
        <div class="description-modal-header">
            <div class="description-modal-title">Description</div>
            <button class="description-modal-close">&times;</button>
        </div>
        <div class="description-modal-content"></div>
    </div>

    <!-- MPesa Modal -->
    <div class="modal-backdrop" id="mpesaBackdrop"></div>
    <div class="mpesa-modal" id="mpesaModal">
        <div class="mpesa-modal-header">
            <div class="mpesa-modal-title">MPesa Payment</div>
            <button class="mpesa-modal-close">&times;</button>
        </div>
        <div class="mpesa-price" id="mpesaPrice"></div>
        <form class="mpesa-form" id="mpesaForm">
            <input type="tel" class="mpesa-input" id="mpesaNumber" placeholder="Enter MPesa number (e.g., 07XX XXX XXX)" pattern="^0[17][0-9]{8}$" required>
            <button type="submit" class="mpesa-submit">Pay with MPesa</button>
        </form>
    </div>

    <script>
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Get button elements
            const addBotBtn = document.getElementById('addBotBtn');
            const derivBtn = document.getElementById('derivBtn');
            const mtBtn = document.getElementById('mtBtn');
            const closeModalBtn = document.querySelector('.modal-close');
            const cancelBtn = document.querySelector('.btn-secondary');
            const submitBtn = document.querySelector('.btn-primary[onclick="submitForm()"]');
            const pricingOptions = document.querySelectorAll('.pricing-option');
            const platformSelect = document.getElementById('platform');
            const botFileInput = document.getElementById('botFile');

            // Add event listeners
            if (addBotBtn) {
                addBotBtn.addEventListener('click', function() {
                    document.getElementById('addBotModal').style.display = 'block';
                    document.body.style.overflow = 'hidden';
                });
            }

            if (derivBtn) {
                derivBtn.addEventListener('click', function() {
                    alert('Deriv connection coming soon');
                });
            }

            if (mtBtn) {
                mtBtn.addEventListener('click', function() {
                    alert('MT4/MT5 connection coming soon');
                });
            }

            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', function() {
                    document.getElementById('addBotModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                    document.getElementById('addBotForm').reset();
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    document.getElementById('addBotModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                    document.getElementById('addBotForm').reset();
                });
            }

            if (submitBtn) {
                submitBtn.addEventListener('click', async function() {
                    const form = document.getElementById('addBotForm');
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        return;
                    }

                    try {
                        const formData = new FormData();
                        formData.append('name', document.getElementById('botName').value);
                        formData.append('description', document.getElementById('description').value);
                        formData.append('platform', document.getElementById('platform').value);
                        formData.append('price', document.getElementById('price').value || 'Free');
                        formData.append('tutorialLink', document.getElementById('tutorialLink').value);
                        
                        const fileInput = document.getElementById('botFile');
                        if (fileInput.files[0]) {
                            formData.append('botFile', fileInput.files[0]);
                        }

                        const urlParams = new URLSearchParams(window.location.search);
                        const partnerId = urlParams.get('partnerId');
                        const ownerName = urlParams.get('name');

                        const response = await fetch('/submit-bot?partnerId=' + partnerId + '&name=' + encodeURIComponent(ownerName), {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();
                        if (result.success) {
                            addBotCard(result.data);
                            document.getElementById('addBotModal').style.display = 'none';
                            document.body.style.overflow = 'auto';
                            form.reset();
                            alert('Bot added successfully!');
                        } else {
                            throw new Error(result.error);
                        }
                    } catch (error) {
                        console.error('Error submitting bot:', error);
                        alert('Failed to add bot. Please try again.');
                    }
                });
            }

            pricingOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const priceInput = document.getElementById('price');
                    pricingOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    if (this.textContent.trim() === 'Paid') {
                        priceInput.style.display = 'block';
                        priceInput.required = true;
                    } else {
                        priceInput.style.display = 'none';
                        priceInput.required = false;
                        priceInput.value = '';
                    }
                });
            });

            if (platformSelect) {
                platformSelect.addEventListener('change', function() {
                    const fileInput = document.getElementById('botFile');
                    // Remove file type restrictions
                    fileInput.accept = '*.*';
                });
            }

            if (botFileInput) {
                botFileInput.addEventListener('change', function() {
                    const file = this.files[0];
                    if (!file) return;

                    const statusEl = document.getElementById('uploadStatus');
                    const progressEl = document.getElementById('uploadProgress');
                    
                    statusEl.className = 'file-upload-status show';
                    
                    let progress = 0;
                    const interval = setInterval(function() {
                        progress += 10;
                        progressEl.textContent = progress + '%';
                        
                        if (progress >= 100) {
                            clearInterval(interval);
                            
                            statusEl.innerHTML = 
                                '<div class="upload-success">' +
                                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
                                '<path d="M13.3 4.3L6 11.6L2.7 8.3L1.3 9.7L6 14.4L14.7 5.7L13.3 4.3Z" fill="currentColor"/>' +
                                '</svg>' +
                                'File uploaded successfully' +
                                '</div>';
                            
                            setTimeout(function() {
                                statusEl.className = 'file-upload-status';
                            }, 2000);
                        }
                    }, 200);
                });
            }

            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                const modal = document.getElementById('addBotModal');
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    document.getElementById('addBotForm').reset();
                }
            });

            function formatPrice(price) {
                if (price === 'Free') return 'Free';
                const number = parseFloat(price);
                return 'KES ' + number.toLocaleString('en-US');
            }

            function getBotTypeLabel(platform) {
                if (platform === 'deriv') {
                    return {
                        class: 'dbot',
                        label: '<span>Trade on</span> <strong>DerivBot</strong>',
                        icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12zm1-6.5V4H7v3.5H4v2h3V13h2V9.5h3v-2H9z"/></svg>'
                    };
                } else {
                    return {
                        class: 'forex',
                        label: '<span>Trade</span> <strong>FOREX CFDs</strong>',
                        icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4zm1.5 8.5h1V12h1v-1.5h1V12h1v-1.5h1V9H9V7.5h1.5V6H9V4H8v2H7V4H6v2H4.5v1.5H6V9H4.5v1.5zM7 7.5h1V9H7V7.5z"/></svg>'
                    };
                }
            }

            function handleDownload(botName, price, fileName) {
                if (price === 'Free') {
                    // Create a temporary link to download the file
                    const link = document.createElement('a');
                    link.href = '/download/' + fileName; // You'll need to set up this route on your server
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    // Show MPesa modal for paid bots
                    const modal = document.getElementById('mpesaModal');
                    const backdrop = document.getElementById('mpesaBackdrop');
                    const priceDisplay = document.getElementById('mpesaPrice');
                    
                    priceDisplay.textContent = formatPrice(price);
                    modal.style.display = 'block';
                    backdrop.style.display = 'block';

                    // Handle MPesa form submission
                    const form = document.getElementById('mpesaForm');
                    form.onsubmit = function(e) {
                        e.preventDefault();
                        const mpesaNumber = document.getElementById('mpesaNumber').value;
                        // Here you would integrate with your MPesa API
                        alert('Processing payment for ' + formatPrice(price) + ' from ' + mpesaNumber);
                        modal.style.display = 'none';
                        backdrop.style.display = 'none';
                        form.reset();
                    };

                    // Close modal functionality
                    const closeBtn = modal.querySelector('.mpesa-modal-close');
                    closeBtn.onclick = function() {
                        modal.style.display = 'none';
                        backdrop.style.display = 'none';
                        form.reset();
                    };

                    backdrop.onclick = function() {
                        modal.style.display = 'none';
                        backdrop.style.display = 'none';
                        form.reset();
                    };
                }
            }

            function addBotCard(bot) {
                const botGrid = document.querySelector('.bot-grid');
                const card = document.createElement('div');
                card.className = 'bot-card';
                
                const fileInput = document.getElementById('botFile');
                const fileName = fileInput.files[0] ? fileInput.files[0].name : '';
                const botType = getBotTypeLabel(bot.platform);
                const capitalizedBotName = bot.name.charAt(0).toUpperCase() + bot.name.slice(1);
                
                // Get the current user's name and ID from the URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const ownerName = decodeURIComponent(urlParams.get('name') || 'Unknown User');
                const ownerId = urlParams.get('partnerId') || 'Unknown ID';
                // Show only first 6 characters of ID followed by '...'
                const partialId = ownerId.substring(0, 6) + '...';
                
                card.innerHTML = 
                    '<div class="bot-header">' +
                        '<h3 class="bot-name">' + capitalizedBotName + '</h3>' +
                        '<span class="bot-platform">' + (bot.platform === 'deriv' ? 'Deriv' : 'MT4/MT5') + '</span>' +
                    '</div>' +
                    '<div class="bot-type ' + botType.class + '">' +
                        botType.icon +
                        botType.label +
                    '</div>' +
                    '<div class="bot-description">' + bot.description + '</div>' +
                    '<button class="description-more">' +
                        '<span>Read more</span>' +
                        '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
                            '<path d="M8 10L4 6h8l-4 4z"/>' +
                        '</svg>' +
                    '</button>' +
                    '<div class="bot-owner">' +
                        '<svg viewBox="0 0 16 16" fill="currentColor">' +
                            '<path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2 1H6a4 4 0 00-4 4v1h12v-1a4 4 0 00-4-4z"/>' +
                        '</svg>' +
                        '<span class="bot-owner-name" title="' + ownerName + '">' + ownerName + '</span>' +
                        '<span class="bot-owner-id">#' + partialId + '</span>' +
                    '</div>' +
                    (fileName ? 
                        '<div class="bot-file">' +
                            '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
                                '<path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM11 4.5V0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5h-3z"/>' +
                            '</svg>' +
                            '<span class="bot-file-name">' + fileName + '</span>' +
                        '</div>' : ''
                    ) +
                    '<div class="bot-meta">' +
                        '<div class="bot-price ' + (bot.price === 'Free' ? 'free' : '') + '">' +
                            '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
                                '<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12zm.8-8.2V4h-1.6v1.8H6v1.6h1.2V9h1.6V7.4H10V5.8H8.8z"/>' +
                            '</svg>' +
                            formatPrice(bot.price) +
                        '</div>' +
                    '</div>' +
                    '<div class="bot-actions">' +
                        '<button class="bot-download" data-bot-name="' + bot.name + '" data-price="' + bot.price + '" data-filename="' + fileName + '">' +
                            '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
                                '<path d="M8 12l-4.7-4.7 1.4-1.4L7 8.2V1h2v7.2l2.3-2.3 1.4 1.4L8 12zm-7 2h14v2H1v-2z"/>' +
                            '</svg>' +
                            'Download' +
                        '</button>' +
                        (bot.tutorialLink ? 
                            '<a href="' + bot.tutorialLink + '" target="_blank" class="bot-tutorial">' +
                                '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">' +
                                    '<path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12zm-.8-4.8h1.6V6.4H7.2v2.8zm0-4h1.6V3.6H7.2v1.6z"/>' +
                                '</svg>' +
                                'Tutorial' +
                            '</a>' : ''
                        ) +
                    '</div>';

                // Add event listeners for description modal
                const readMoreBtn = card.querySelector('.description-more');
                const descriptionText = card.querySelector('.bot-description').textContent;
                
                readMoreBtn.addEventListener('click', function() {
                    const modal = document.getElementById('descriptionModal');
                    const backdrop = document.getElementById('descriptionBackdrop');
                    const content = modal.querySelector('.description-modal-content');
                    content.textContent = descriptionText;
                    modal.style.display = 'block';
                    backdrop.style.display = 'block';
                });

                // Add download button event listener
                const downloadBtn = card.querySelector('.bot-download');
                if (downloadBtn) {
                    downloadBtn.addEventListener('click', function() {
                        const botName = this.dataset.botName;
                        const price = this.dataset.price;
                        const fileName = this.dataset.filename;
                        handleDownload(botName, price, fileName);
                    });
                }

                botGrid.appendChild(card);
            }

            // Add description modal close functionality
            const modal = document.getElementById('descriptionModal');
            const backdrop = document.getElementById('descriptionBackdrop');
            const closeBtn = modal.querySelector('.description-modal-close');

            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                backdrop.style.display = 'none';
            });

            backdrop.addEventListener('click', function() {
                modal.style.display = 'none';
                backdrop.style.display = 'none';
            });
        });
    </script>
</body>
</html>
`;

// Route to serve the dashboard
router.get('/', (req, res) => {
    const { partnerId, name } = req.query;
    
    if (!partnerId) {
        return res.status(401).send('Unauthorized: Partner ID is required');
    }

    const userName = name ? decodeURIComponent(name) : 'Partner';
    const modifiedDashboardHTML = dashboardHTML.replace(
        '<span class="logo-highlight">DFirst</span> Partners Bots',
        `<span class="logo-highlight">DFirst</span> Partners Bots - ${userName}`
    );

    res.send(modifiedDashboardHTML);
});

// Add a route to handle bot submissions with partner tracking
router.post('/submit-bot', upload.single('botFile'), async (req, res) => {
    try {
        const { partnerId, name: ownerName } = req.query;
        if (!partnerId) {
            return res.status(401).json({ error: 'Unauthorized: Partner ID is required' });
        }

        const { name, description, platform, price, tutorialLink } = req.body;
        const file = req.file;

        // Upload file to Firebase Storage
        const fileName = `bots/${partnerId}/${Date.now()}_${file.originalname}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file.buffer);

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        // Save bot data to Firestore
        const botData = {
            name,
            description,
            platform,
            price: price || 'Free',
            tutorialLink,
            fileName: file.originalname,
            fileUrl: downloadURL,
            partnerId,
            ownerName: ownerName || 'Unknown User',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'bots'), botData);

        res.json({ 
            success: true, 
            message: 'Bot submitted successfully',
            data: {
                ...botData,
                id: docRef.id
            }
        });
    } catch (error) {
        console.error('Error submitting bot:', error);
        res.status(500).json({ 
            error: 'Failed to submit bot',
            details: error.message 
        });
    }
});

module.exports = router;
