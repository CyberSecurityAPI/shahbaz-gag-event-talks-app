import os
import requests
import feedparser
from datetime import datetime
from flask import Flask, render_template, jsonify

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def parse_date(date_str):
    """Try parsing the date string from the feed and format it nicely."""
    try:
        # Common ISO format (e.g. '2026-06-25T14:53:40Z')
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%B %d, %Y")
    except ValueError:
        try:
            # RSS format (e.g. 'Thu, 25 Jun 2026 14:53:40 GMT')
            dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %Z")
            return dt.strftime("%B %d, %Y")
        except ValueError:
            return date_str

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/releases")
def get_releases():
    try:
        # Fetch the feed with a timeout
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(FEED_URL, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse with feedparser
        feed = feedparser.parse(response.content)
        
        if not feed.entries:
            return jsonify({"error": "No release notes found in the feed."}), 404
            
        parsed_entries = []
        for entry in feed.entries:
            # Safely extract content
            content_html = ""
            if "content" in entry and len(entry.content) > 0:
                content_html = entry.content[0].value
            elif "summary" in entry:
                content_html = entry.summary
            elif "description" in entry:
                content_html = entry.description

            parsed_entries.append({
                "id": entry.get("id", entry.get("link", "")),
                "title": entry.get("title", "No Title"),
                "date": parse_date(entry.get("updated", entry.get("published", ""))),
                "raw_date": entry.get("updated", entry.get("published", "")),
                "content": content_html,
                "link": entry.get("link", "https://cloud.google.com/bigquery/docs/release-notes")
            })
            
        return jsonify({"releases": parsed_entries})
        
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error fetching feed: {e}")
        return jsonify({"error": f"Failed to fetch release notes: {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Error parsing feed: {e}")
        return jsonify({"error": f"An error occurred while processing the feed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
