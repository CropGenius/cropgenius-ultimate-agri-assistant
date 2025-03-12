
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <Layout>
      <div className="container mx-auto pt-8">
        <h1 className="text-2xl font-bold text-center mb-6">Join CropGenius</h1>
        <AuthForm />
      </div>
    </Layout>
  );
}
