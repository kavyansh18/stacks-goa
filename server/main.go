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


func verifyQAWithGemini(question, answer string) bool {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		fmt.Println("GEMINI_API_KEY not set")
		return false
	}

	
	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": fmt.Sprintf("Question: %s\nAnswer: %s\nVerify if the answer is correct. Respond only with true or false, and give correct option also", question, answer)},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey

	//url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Request error:", err)
		return false
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("🔹 Raw Response:", string(body)) // Debug print

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Println("JSON parse error:", err)
		return false
	}

	
	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		fmt.Println("No candidates in response")
		return false
	}

	first, _ := candidates[0].(map[string]interface{})
	content, _ := first["content"].(map[string]interface{})
	parts, _ := content["parts"].([]interface{})

	if len(parts) == 0 {
		return false
	}

	textPart, _ := parts[0].(map[string]interface{})
	text, _ := textPart["text"].(string)

	fmt.Println("🔹 Gemini Reply:", text)

	return text == "true" || text == "True"
}

func main() {
	
	err := godotenv.Load()
	if err != nil {
		fmt.Println("No .env file found, falling back to system env")
	}

	
	// qa, _ := fetchQA("https://your-api.com/qa")

	// fmt.Println("Q:", qa.Question)
	// fmt.Println("A:", qa.Answer)

	// verified := verifyQAWithGemini(qa.Question, qa.Answer)

	
// abhi check karne ke liye.....
qa := QA{
    Question: "who won ipl in 2025",
    Answer:   "rcb",
}

fmt.Println("Q:", qa.Question)
fmt.Println("A:", qa.Answer)

verified := verifyQAWithGemini(qa.Question, qa.Answer)
//.......

	fmt.Println("Verified:", verified)
}
