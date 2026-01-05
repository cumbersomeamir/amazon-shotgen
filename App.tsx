
import React, { useState, useRef } from 'react';
import { ProductShot, ShotType } from './types';
import { generateProductImage } from './services/geminiService';
import ShotCard from './components/ShotCard';

const INITIAL_SHOTS: ProductShot[] = [
  { id: '1', type: 'MAIN', label: 'Main Listing Image', description: 'Hero shot on pure white background. The primary image customers see in search results.', status: 'idle' },
  { id: '2', type: 'ANGLE', label: 'Feature Angle', description: '3/4 perspective shot highlighting the overall form and key physical design features.', status: 'idle' },
  { id: '3', type: 'DETAIL', label: 'Material & Quality', description: 'Macro shot showing off textures, stitching, buttons or finish to prove build quality.', status: 'idle' },
  { id: '4', type: 'LIFESTYLE', label: 'Lifestyle Context', description: 'Real-world application showing the product in its natural intended environment.', status: 'idle' },
  { id: '5', type: 'DIMENSION', label: 'Profile View', description: 'Side-on profile shot showing thickness, proportions, and sleek design elements.', status: 'idle' },
];

const App: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [shots, setShots] = useState<ProductShot[]>(INITIAL_SHOTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateShot = (id: string, updates: Partial<ProductShot>) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateShot = async (shot: ProductShot, name: string, refImg: string | null) => {
    updateShot(shot.id, { status: 'generating', error: undefined });
    try {
      const url = await generateProductImage(name || 'product', shot.type, refImg || undefined);
      updateShot(shot.id, { status: 'completed', imageUrl: url });
    } catch (err: any) {
      updateShot(shot.id, { status: 'error', error: err.message });
    }
  };

  const handleGenerateAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    if (!productName.trim() && !referenceImage) return;

    setIsProcessing(true);
    const promises = shots.map(shot => handleGenerateShot(shot, productName, referenceImage));
    await Promise.allSettled(promises);
    setIsProcessing(false);
  };

  const handleRetry = (shot: ProductShot) => {
    handleGenerateShot(shot, productName, referenceImage);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <i className="fa-solid fa-camera-retro text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Amazon <span className="text-orange-500">ShotGen</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-orange-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Bulk Tools</a>
            <button className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Account
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Amazon Listing <span className="text-orange-500">Image Studio</span>
          </h2>
          <p className="text-slate-600 mb-10 leading-relaxed text-lg">
            Upload a reference photo or describe your product to generate a complete professional shot pack.
          </p>

          <form onSubmit={handleGenerateAll} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 transition-all">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Upload Section */}
                <div className="w-full md:w-1/3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      referenceImage ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-orange-400 bg-slate-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    {referenceImage ? (
                      <>
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover rounded-lg" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); clearReferenceImage(); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <i className="fa-solid fa-cloud-arrow-up text-slate-400 text-3xl mb-2"></i>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Reference Photo</p>
                        <p className="text-[10px] text-slate-400 mt-1">Click to upload product image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Section */}
                <div className="flex-1 flex flex-col justify-center space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name & Description</label>
                    <textarea
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Minimalist Ceramic Coffee Mug, Matte Black finish..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none h-24"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isProcessing || (!productName.trim() && !referenceImage)}
                    className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-lg shadow-lg ${
                      isProcessing || (!productName.trim() && !referenceImage)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                        Processing Master Pack...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-sparkles"></i>
                        Generate Amazon Pack
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-circle-check text-green-500"></i>
              White Background Ready
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-circle-check text-green-500"></i>
              Lifestyle Contexts
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <i className="fa-solid fa-circle-check text-green-500"></i>
              Macro Detail Shots
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {shots.map((shot) => (
            <ShotCard 
              key={shot.id} 
              shot={shot} 
              onRetry={() => handleRetry(shot)} 
            />
          ))}
        </div>

        {/* Pro Tips Section */}
        <section className="mt-24 border-t border-slate-200 pt-16">
          <div className="flex flex-col items-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900">Conversion Focused Assets</h3>
            <p className="text-slate-500">Everything you need to beat the competition on the search results page.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <i className="fa-solid fa-expand text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">High Resolution</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Images are generated with professional clarity, perfect for Amazon's zoom functionality to reveal hidden textures.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                <i className="fa-solid fa-camera-retro text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Visual Consistency</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our AI maintains lighting and material properties across all 5 standard Amazon perspectives for a cohesive brand feel.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
                <i className="fa-solid fa-box-open text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Ready to List</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every image follows Amazon's strict requirements: no watermarks, clear focus, and high-converting compositions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-800 pb-12 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-camera-retro text-white text-sm"></i>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">Amazon ShotGen</span>
            </div>
            <nav className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs gap-4">
            <p>&copy; 2024 Amazon ShotGen Pro AI. All product images generated are royalty-free.</p>
            <div className="flex gap-6 text-xl">
              <i className="fa-brands fa-x-twitter hover:text-white cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-instagram hover:text-white cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-product-hunt hover:text-white cursor-pointer transition-colors"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
