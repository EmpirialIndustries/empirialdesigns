import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ChatInterface from "./pages/ChatInterface";
import GenerateWebsite from "./pages/GenerateWebsite";
import Preview from "./pages/Preview";
import RepoManagement from "./pages/RepoManagement";
import Dashboard from "./pages/Dashboard";
import Builder from "./pages/Builder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder/:projectId" element={<Builder />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/generate" element={<GenerateWebsite />} />
          <Route path="/repos" element={<RepoManagement />} />
          <Route path="/preview/:repoId" element={<Preview />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

