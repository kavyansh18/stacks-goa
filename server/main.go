package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)


type QA struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type VerifyResponse struct {
	Verified bool   `json:"verified"`
	Reply    string `json:"reply"`
}


func fetchQA(apiURL string) (QA, error) {
	resp, err := http.Get(apiURL)
	if err != nil {
		return QA{}, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var qa QA
	err = json.Unmarshal(body, &qa)
	return qa, err
}


func verifyQAWithGemini(question, answer string) (bool, string) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		fmt.Println("❌ GEMINI_API_KEY not set")
		return false, ""
	}

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": fmt.Sprintf("Question: %s\nAnswer: %s\nVerify if the answer is correct. Respond only with true or false, and give the correct option if false.", question, answer)},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Request error:", err)
		return false, ""
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("🔹 Raw Response:", string(body)) //

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Println("JSON parse error:", err)
		return false, ""
	}

	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return false, ""
	}

	first, _ := candidates[0].(map[string]interface{})
	content, _ := first["content"].(map[string]interface{})
	parts, _ := content["parts"].([]interface{})

	if len(parts) == 0 {
		return false, ""
	}

	textPart, _ := parts[0].(map[string]interface{})
	text, _ := textPart["text"].(string)

	fmt.Println("🔹 Gemini Reply:", text)

	verified := text == "true" || text == "True"
	return verified, text
}


func verifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var qa QA
	err := json.NewDecoder(r.Body).Decode(&qa)

	
	if err != nil || qa.Question == "" || qa.Answer == "" {
		fmt.Println("No valid input JSON, fetching from external API instead")
		qa, err = fetchQA("https://your-api.com/qa")
		if err != nil {
			http.Error(w, "Failed to fetch external QA", http.StatusInternalServerError)
			return
		}
	}

	verified, reply := verifyQAWithGemini(qa.Question, qa.Answer)

	resp := VerifyResponse{
		Verified: verified,
		Reply:    reply,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("No .env file found, falling back to system env")
	}

	http.HandleFunc("/verify", verifyHandler)

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
