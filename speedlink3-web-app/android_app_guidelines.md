# Speedlink3 companion Android App Wrapper Configuration
## Package Name: `com.speedlink3.web`

This guide outlines the Kotlin codebase setup to initialize Google's UMP (User Messaging Platform) SDK, prompt EU users for GDPR consent, cache web pages offline, append app signatures for telemetry loggers, and anchor native AdMob banners.

---

## 1. Native Build Configuration (`app/build.gradle`)

```groovy
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.11.0'
    
    // Google User Messaging Platform (UMP) SDK for GDPR Consent
    implementation 'com.google.android.ump:user-messaging-platform:2.2.0'
    
    // Google Mobile Ads (AdMob) SDK
    implementation 'com.google.android.gms:play-services-ads:23.1.0'
}
```

---

## 2. Complete Kotlin Consent & WebView Setup (`MainActivity.kt`)

```kotlin
package com.speedlink3.web

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
importimport android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import com.google.android.ump.ConsentDebugSettings
import com.google.android.ump.ConsentForm
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var consentInformation: ConsentInformation
    private var adView: AdView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // 1. Initialize UMP SDK and request GDPR consent parameters
        requestUserConsent()
    }

    private fun requestUserConsent() {
        // For debug testing in EU region simulation:
        val debugSettings = ConsentDebugSettings.Builder(this)
            .setDebugGeography(ConsentDebugSettings.DebugGeography.DEBUG_GEOGRAPHY_EEA)
            .addTestDeviceHashedId("TEST_DEVICE_HASH_ID")
            .build()

        val params = ConsentRequestParameters.Builder()
            .setConsentDebugSettings(debugSettings)
            .setTagForUnderAgeOfConsent(false) // COPPA child tagging flag (false if general audiences)
            .build()

        consentInformation = UserMessagingPlatform.getConsentInformation(this)
        consentInformation.requestConsentInfoUpdate(
            this,
            params,
            {
                // Consent information updated successfully, load form if required
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(
                    this
                ) { formError ->
                    if (formError == null) {
                        // Consent gathered or form not required, initialize Ads & load WebView
                        if (consentInformation.canRequestAds()) {
                            initializeMobileAds()
                        }
                        setupAndLoadWebView()
                    } else {
                        // Fallback, load site directly
                        setupAndLoadWebView()
                    }
                }
            },
            { requestConsentError ->
                // Loading failed, fallback directly to web
                setupAndLoadWebView()
            }
        )
    }

    private fun initializeMobileAds() {
        MobileAds.initialize(this) {}
        runOnUiThread {
            loadNativeBanner()
        }
    }

    private fun loadNativeBanner() {
        val adContainer = findViewById<FrameLayout>(R.id.ad_container)
        adView = AdView(this).apply {
            adUnitId = "ca-app-pub-3940256099942544/6300978111" // Test Banner ID
            setAdSize(AdSize.BANNER)
        }
        adContainer.addView(adView)
        val adRequest = AdRequest.Builder().build()
        adView?.loadAd(adRequest)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupAndLoadWebView() {
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                view.loadUrl(url)
                return true
            }
        }

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        
        // 2. Telemetry Signature: Append custom signature to User-Agent
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent Speedlink3AndroidApp/1.0.0"

        // 3. Offline Caching settings
        settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
        
        // Load dynamic portal url (using local debug server)
        webView.loadUrl("http://10.0.2.2:8000/")
    }

    override fun onDestroy() {
        adView?.destroy()
        super.onDestroy()
    }
}
```

---

## 3. Native Layout Template (`activity_main.xml`)

An absolute frame layout that anchors the primary WebView and slides the native AdMob container block dynamically at the bottom edge.

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_match"
    android:layout_height="match_parent"
    android:background="#0a0d16">

    <!-- WebView Content Frame -->
    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_above="@id/ad_container" />

    <!-- Google AdMob Compliant Banner container -->
    <FrameLayout
        android:id="@+id/ad_container"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:background="#121829" />

</RelativeLayout>
```
