import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Log para analytics/debugging
    const errorData = {
      timestamp: new Date().toISOString(),
      path: location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    
    console.log("NotFound Error Details:", errorData);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-4xl font-bold text-gray-900 mb-2">404</CardTitle>
          <h2 className="text-xl text-gray-600">Página não encontrada</h2>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              A página que você está procurando não existe ou foi movida.
            </p>
            <p className="text-sm text-gray-500 font-mono bg-gray-100 rounded px-2 py-1 inline-block">
              {location.pathname}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <Button 
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para Dashboard
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;