import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { UploadIcon, LogoutIcon } from "@/components/icons/Icons";
import { useNavigate } from "react-router-dom";

interface Prediction {
  className: string;
  probability: number;
}

const Dashboard = () => {
  const [image, setImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [model, setModel] = useState<any>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(10);

  const imageRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelError(null);
        
        // First load metadata
        const metadataResponse = await fetch("/assets/metadata.json");
        if (!metadataResponse.ok) {
          throw new Error(`Failed to load metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
        }
        
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
        
        // Then load model
        if (!window.tmImage) {
          throw new Error("Teachable Machine library not loaded. Please check your internet connection.");
        }
        
        const loadedModel = await window.tmImage.load(
          "/assets/model.json",
          "/assets/metadata.json"
        );
        
        setModel(loadedModel);
        
        toast({
          title: "Model loaded",
          description: `Ready to analyze ${metadataJson.modelName || "soil samples"}`,
        });
      } catch (error) {
        console.error("Error loading model:", error);
        setModelError(`Error loading model: ${error instanceof Error ? error.message : String(error)}`);
        toast({
          title: "Model loading failed",
          description: "Please check that model files exist in the assets folder",
          variant: "destructive",
        });
      }
    };

    loadModel();
    
    // Load TensorFlow.js and Teachable Machine scripts if not already loaded
    const loadScripts = () => {
      if (!document.querySelector('script[src*="tensorflow"]')) {
        const tensorflowScript = document.createElement('script');
        tensorflowScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js";
        document.head.appendChild(tensorflowScript);
      }
      
      if (!document.querySelector('script[src*="teachablemachine"]')) {
        const teachableScript = document.createElement('script');
        teachableScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js";
        document.head.appendChild(teachableScript);
      }
    };
    
    loadScripts();
  }, [toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous predictions
    setPredictions([]);
    
    // Create object URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    
    // Reset the file input
    if (event.target) {
      event.target.value = "";
    }
    
    toast({
      title: "Image uploaded",
      description: "Click 'Analyze Soil' to process the image",
    });
  };

  const analyzeImage = async () => {
    if (!image || !imageRef.current) {
      toast({
        title: "Cannot analyze",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (!model) {
      toast({
        title: "Model not loaded",
        description: "The soil classification model is not loaded yet",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setPredictions([]);
    
    try {
      setProgressValue(30);
      // Short delay to ensure image is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setProgressValue(50);
      // Run prediction on the image
      const prediction = await model.predict(imageRef.current);
      setProgressValue(80);
      
      setPredictions(prediction);
      
      toast({
        title: "Analysis complete",
        description: "Soil classification results are ready",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setProgressValue(100);
      // Reset progress after a delay
      setTimeout(() => setProgressValue(0), 500);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };
  
  // Find the highest probability prediction
  const topPrediction = predictions.length > 0 
    ? predictions.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
      ) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-light to-soil-light">
      <header className="bg-soil-dark text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soil Snapshot AI</h1>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-soil hover:text-white"
            onClick={handleLogout}
          >
            <LogoutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="h-full shadow-lg border-soil-light overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-soil-light/50 to-earth-light/50">
                <CardTitle>Soil Sample Analysis</CardTitle>
                <CardDescription>
                  Upload a soil image to classify its type and properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div 
                  className="border-2 border-dashed border-soil rounded-lg p-6 text-center cursor-pointer hover:bg-soil/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? (
                    <div className="relative">
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Uploaded soil sample"
                        className="mx-auto max-h-64 rounded-md"
                        crossOrigin="anonymous"
                      />
                      <div className="mt-2 text-sm text-muted-foreground">
                        Click to upload a different image
                      </div>
                    </div>
                  ) : (
                    <div className="py-12">
                      <UploadIcon className="h-16 w-16 mx-auto text-soil mb-4" />
                      <p className="text-soil-dark font-medium text-lg">
                        Click to upload a soil image
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, PNG or GIF, up to 10MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>

                <Button
                  className="w-full bg-earth hover:bg-earth-dark h-12 text-base font-medium"
                  onClick={analyzeImage}
                  disabled={!image || isAnalyzing || !model}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Soil Sample"}
                </Button>
                
                {modelError && (
                  <div className="text-destructive p-4 bg-destructive/10 rounded-md mt-2 text-center">
                    {modelError}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="h-full shadow-lg border-soil-light">
              <CardHeader className="bg-gradient-to-r from-soil-light/50 to-earth-light/50">
                <CardTitle>Classification Results</CardTitle>
                <CardDescription>
                  {predictions.length > 0 
                    ? "Analysis of your soil sample" 
                    : "Upload and analyze a sample to see results"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {isAnalyzing ? (
                  <div className="space-y-4 py-8">
                    <p className="text-center text-muted-foreground">Processing image...</p>
                    <Progress value={progressValue} className="w-full h-3" />
                  </div>
                ) : predictions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-secondary rounded-lg p-4 border border-earth/20">
                      <h3 className="font-medium mb-1">Primary Classification</h3>
                      <div className="text-2xl font-bold text-earth-dark">{topPrediction?.className}</div>
                      <div className="text-sm text-muted-foreground">
                        {(topPrediction?.probability * 100).toFixed(1)}% confidence
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">All Classifications</h3>
                      <div className="space-y-3">
                        {predictions.map((prediction, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{prediction.className}</span>
                              <span className="font-medium">{(prediction.probability * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.probability * 100} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No data yet</p>
                    <p className="text-sm mt-1">Upload and analyze a soil sample to see results</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start border-t p-6 pt-4 bg-secondary/30">
                {model && metadata ? (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">About this model:</p>
                    <div className="mt-2">
                      <p>Name: {metadata.modelName || "Soil Classification Model"}</p>
                      <p>Classes: {metadata.labels?.length || 0}</p>
                    </div>
                  </div>
                ) : modelError ? (
                  <div className="text-sm text-destructive">
                    <p className="font-medium">Model Error:</p>
                    <p className="mt-1">{modelError}</p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>Loading model information...</p>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
