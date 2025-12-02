
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSettings, ChatMessage, AICoachProps, WorkoutPlan } from '../types';
import { createFitnessChat } from '../services/geminiService';
import { Send, Bot, Loader2, CheckCircle, ClipboardList } from 'lucide-react';
import { Chat } from '@google/genai';
import { t } from '../utils/translations';

const AICoach: React.FC<AICoachProps> = ({ userSettings, onAddPlan }) => {
  const navigate = useNavigate();
  const lang = userSettings.language || 'zh-TW';
  const txt = t[lang];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: txt.coach_welcome,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlanIds, setSavedPlanIds] = useState<Set<string>>(new Set());
  
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-initialize chat if language changes
  useEffect(() => {
    chatSession.current = createFitnessChat(lang);
    // Optional: clear messages or add a system note when language changes, 
    // but for now we keep history and just change future response language.
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!chatSession.current) {
          chatSession.current = createFitnessChat(lang);
      }

      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      
      // Handle Function Calls (Tools)
      const functionCalls = result.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        // We found a function call
        const call = functionCalls[0];
        
        if (call.name === 'create_workout_plan') {
           const planArgs = call.args;
           // Ensure we have a valid ID for the tool call
           const tId = call.id || `tool-${Date.now()}`;
           
           const toolMsg: ChatMessage = {
             id: Date.now().toString(),
             role: 'model',
             timestamp: Date.now(),
             toolCallId: tId,
             functionCall: {
               name: call.name,
               args: planArgs
             }
           };
           setMessages(prev => [...prev, toolMsg]);
        }
      } else {
        // Standard text response
        const responseText = result.text;
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: txt.coach_error,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async (toolCallId: string, args: any) => {
    // 1. Validate Args
    if (!args || !args.days || !Array.isArray(args.days)) {
        alert(txt.coach_plan_incomplete);
        return;
    }

    // 2. Create the plan object
    const newPlan: WorkoutPlan = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      goal: args.goal || "Custom Goal",
      level: args.level || "Intermediate",
      equipment: "Custom",
      duration: args.duration || 45,
      days: args.days
    };

    // 3. Save to global state (Append to list)
    onAddPlan(newPlan);
    setSavedPlanIds(prev => new Set(prev).add(toolCallId));

    // 4. Update UI to show it's done
    const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: txt.coach_saved_msg,
        timestamp: Date.now(),
     };
     setMessages(prev => [...prev, aiMsg]);

    // 5. Navigate
    setTimeout(() => {
        navigate('/workouts');
    }, 1500);

    // 6. Send success back to model (Background process - fire and forget)
    /*if (chatSession.current) {
       chatSession.current.sendToolResponse({
            functionResponses: [{
                name: 'create_workout_plan',
                id: toolCallId,
                response: { result: "Plan saved successfully." }
            }]
         }).catch(e => console.error("Background AI sync failed, but plan was saved locally.", e));
    } */
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-6 py-4 border-b border-slate-100 shadow-sm z-10">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bot className="text-emerald-600" /> {txt.coach_title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // Special Rendering for Function Calls (Plan Suggestions)
          if (msg.functionCall && msg.functionCall.name === 'create_workout_plan') {
             const args = msg.functionCall.args;
             const tId = msg.toolCallId || 'unknown';
             const isSaved = savedPlanIds.has(tId);

             return (
               <div key={msg.id} className="flex justify-start">
                 <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full max-w-xs animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{txt.coach_plan_suggestion}</p>
                            <p className="text-xs text-slate-500">{args.days?.length || 0} {txt.plan_days_week} • {args.goal}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        {args.days?.slice(0, 3).map((d: any, i: number) => (
                            <div key={i} className="text-xs flex justify-between">
                                <span className="font-semibold text-slate-700">{d.day}</span>
                                <span className="text-slate-500">{d.focus}</span>
                            </div>
                        ))}
                        {args.days?.length > 3 && <p className="text-xs text-slate-400 italic">+ {args.days.length - 3} ...</p>}
                    </div>

                    <button 
                        onClick={() => !isSaved && handleSavePlan(tId, args)}
                        disabled={isSaved}
                        className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                            isSaved 
                            ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                        }`}
                    >
                        {isSaved ? <><CheckCircle size={16} /> {txt.coach_btn_saved}</> : <><CheckCircle size={16} /> {txt.coach_btn_save}</>}
                    </button>
                 </div>
               </div>
             );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text && formatText(msg.text)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin text-emerald-500" size={16} />
              <span className="text-xs text-slate-400">{txt.coach_thinking}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={txt.coach_input_ph}
            className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AICoach;
