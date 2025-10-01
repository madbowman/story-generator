"""
Ollama AI Client
Handles communication with local Ollama instance
"""
import requests
import json
from typing import Dict, List, Optional


class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.default_model = "llama3.2"
        
    def check_status(self) -> Dict:
        """
        Check if Ollama is running and accessible
        Returns: {"running": bool, "error": str or None}
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            if response.status_code == 200:
                return {"running": True, "error": None}
            else:
                return {"running": False, "error": f"HTTP {response.status_code}"}
        except requests.exceptions.ConnectionError:
            return {"running": False, "error": "Cannot connect to Ollama. Is it running?"}
        except requests.exceptions.Timeout:
            return {"running": False, "error": "Connection timeout"}
        except Exception as e:
            return {"running": False, "error": str(e)}
    
    def list_models(self) -> Dict:
        """
        List all available Ollama models
        Returns: {"success": bool, "models": List[str], "error": str or None}
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                models = [model["name"] for model in data.get("models", [])]
                return {"success": True, "models": models, "error": None}
            else:
                return {"success": False, "models": [], "error": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "models": [], "error": str(e)}
    
    def generate(self, 
                 prompt: str, 
                 model: Optional[str] = None,
                 temperature: float = 0.8,
                 system_prompt: Optional[str] = None) -> Dict:
        """
        Generate AI response
        
        Args:
            prompt: User/context prompt
            model: Model name (defaults to llama3.2)
            temperature: Creativity level 0.0-1.0
            system_prompt: System instructions for AI
            
        Returns: {"success": bool, "response": str, "error": str or None}
        """
        if model is None:
            model = self.default_model
            
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120  # AI generation can take time
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "response": data.get("response", ""),
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "response": "",
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "response": "",
                "error": "Request timeout - AI took too long to respond"
            }
        except Exception as e:
            return {
                "success": False,
                "response": "",
                "error": str(e)
            }
    
    def chat(self,
             messages: List[Dict[str, str]],
             model: Optional[str] = None,
             temperature: float = 0.8) -> Dict:
        """
        Chat with AI using conversation history
        
        Args:
            messages: List of {"role": "user/assistant", "content": "..."}
            model: Model name
            temperature: Creativity level
            
        Returns: {"success": bool, "response": str, "error": str or None}
        """
        if model is None:
            model = self.default_model
            
        try:
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", {})
                return {
                    "success": True,
                    "response": message.get("content", ""),
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "response": "",
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "response": "",
                "error": str(e)
            }