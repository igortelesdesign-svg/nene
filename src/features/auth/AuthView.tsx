import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../../components/common/Logo';

export const AuthView: React.FC = () => {
  const { signIn, signUp, resetPassword, authError, clearAuthError, isConfiguredSupabase } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalMessage(null);
    clearAuthError();

    if (mode === 'forgot') {
      if (!email.trim()) {
        setLocalMessage({ type: 'error', text: 'Informe seu e-mail para recuperar a senha.' });
        return;
      }
      setLoading(true);
      const res = await resetPassword(email.trim());
      setLoading(false);
      if (res.success) {
        setLocalMessage({
          type: 'success',
          text: 'Instruções de recuperação foram enviadas para o seu e-mail.',
        });
      } else {
        setLocalMessage({
          type: 'error',
          text: res.error || 'Não conseguimos processar a solicitação no momento.',
        });
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setLocalMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setLocalMessage({ type: 'error', text: 'Informe seu nome completo.' });
        return;
      }
      if (password.length < 6) {
        setLocalMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
        return;
      }
      setLoading(true);
      const res = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (!res.success) {
        setLocalMessage({
          type: 'error',
          text: res.error || 'Não foi possível concluir o cadastro. Tente novamente.',
        });
      }
    } else {
      setLoading(true);
      const res = await signIn({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (!res.success) {
        setLocalMessage({
          type: 'error',
          text: res.error || 'E-mail ou senha incorretos.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F2EFE6] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#133A34]">
          {mode === 'login' && 'Bem-vindo de volta'}
          {mode === 'signup' && 'Crie sua conta'}
          {mode === 'forgot' && 'Recuperar acesso'}
        </h2>
        <p className="mt-2 text-sm text-[#89A589]">
          {mode === 'login' && 'Acesse a rotina e os cuidados da sua família.'}
          {mode === 'signup' && 'Organize a rotina de quem mais importa.'}
          {mode === 'forgot' && 'Digite seu e-mail cadastrado para redefinir a senha.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFF6EE] py-8 px-6 shadow-sm rounded-2xl sm:px-10 border border-[#89A589]/20">
          {/* Alertas */}
          {(localMessage || authError) && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm ${
                localMessage?.type === 'success'
                  ? 'bg-[#E8F2EC] text-[#133A34] border border-[#89A589]/30'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {localMessage?.type === 'success' ? (
                <CheckCircle2 size={18} className="text-[#133A34] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{localMessage?.text || authError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                  Seu Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#89A589]">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Ana Silva"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] placeholder-[#89A589]/60 focus:outline-none focus:ring-2 focus:ring-[#133A34] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#133A34] mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#89A589]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] placeholder-[#89A589]/60 focus:outline-none focus:ring-2 focus:ring-[#133A34] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#133A34] uppercase tracking-wider">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setLocalMessage(null);
                      }}
                      className="text-xs text-[#F08A6B] hover:underline font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#89A589]">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#89A589]/30 rounded-xl text-[#133A34] placeholder-[#89A589]/60 focus:outline-none focus:ring-2 focus:ring-[#133A34] focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#89A589] hover:text-[#133A34]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#133A34] hover:bg-[#133A34]/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#133A34] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar no NENÊ'}
                      {mode === 'signup' && 'Criar Conta'}
                      {mode === 'forgot' && 'Enviar link de recuperação'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Alternância de Modo */}
          <div className="mt-6 pt-6 border-t border-[#89A589]/20 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-[#89A589]">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLocalMessage(null);
                    clearAuthError();
                  }}
                  className="font-semibold text-[#133A34] hover:underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            ) : (
              <p className="text-sm text-[#89A589]">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalMessage(null);
                    clearAuthError();
                  }}
                  className="font-semibold text-[#133A34] hover:underline"
                >
                  Fazer login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
