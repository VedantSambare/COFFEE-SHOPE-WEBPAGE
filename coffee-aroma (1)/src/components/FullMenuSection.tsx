import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Coffee, ArrowUpDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FullMenuSectionProps {
  products: Product[];
  categories: string[];
  onOpenCustomizer: (product: Product) => void;
  onOpenNotify: (product: Product) => void;
}

export const FullMenuSection: React.FC<FullMenuSectionProps> = ({
  products,
  categories,
  onOpenCustomizer,
  onOpenNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'bestsellers' | 'special'>('all');
  const [sortOrder, setSortOrder] = useState<'price-asc' | 'price-desc' | 'name-asc'>('price-asc');

  const allCategories = useMemo(() => {
    const list: string[] = [];
    categories.forEach((c) => {
      if (c && !list.includes(c)) list.push(c);
    });
    products.forEach((p) => {
      if (p.category && !list.includes(p.category)) list.push(p.category);
    });
    // Remove any categories with 0 items
    return list.filter((cat) =>
      products.some((p) => p.category.toLowerCase() === cat.toLowerCase())
    );
  }, [categories, products]);

  const sortedAndFilteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterMode === 'all' ||
        (filterMode === 'bestsellers' && p.isBestSeller) ||
        (filterMode === 'special' && p.isSpecial);

      return matchesCategory && matchesSearch && matchesFilter;
    });

    // Sort items by price range: Low to High by default
    return filtered.sort((a, b) => {
      if (sortOrder === 'price-asc') {
        return a.price - b.price;
      }
      if (sortOrder === 'price-desc') {
        return b.price - a.price;
      }
      if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return a.price - b.price;
    });
  }, [products, selectedCategory, searchQuery, filterMode, sortOrder]);

  return (
    <section id="menu" className="py-24 bg-[#0A0908] relative overflow-hidden border-b border-[#3B2417]/40">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#B97845]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#B97845]">
            <Coffee className="w-3.5 h-3.5 text-[#C9945C]" />
            <span>FULL ARTISANAL ROSTER</span>
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold uppercase text-[#FFF9F2] tracking-tight">
            EXPLORE <br />
            <span className="italic font-serif-luxury text-[#F4E7D7]">OUR MENU</span>
          </h2>
          <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#C9945C] font-semibold">
            GOOD COFFEE • GOOD FOOD • GOOD MOOD
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#160E0A] border border-[#3B2417] p-4 sm:p-6 rounded-3xl mb-12 shadow-2xl space-y-4">
          
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-[#B97845] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffee, pancakes, frappes..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0A0908] border border-[#3B2417] text-xs text-[#FFF9F2] focus:outline-none focus:border-[#B97845] transition-colors"
              />
            </div>

            {/* Quick Filters & Price Sort Control */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto select-none">
              {/* Sort selector: Low to High */}
              <div className="flex items-center gap-1.5 bg-[#0A0908] border border-[#3B2417] px-3 py-2 rounded-2xl text-xs font-mono text-[#F4E7D7]/80">
                <ArrowDownWideNarrow className="w-3.5 h-3.5 text-[#B97845]" />
                <span className="text-[10px] text-[#F4E7D7]/60 uppercase font-bold">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-[#FFF9F2] focus:outline-none cursor-pointer"
                >
                  <option value="price-asc" className="bg-[#160E0A] text-[#FFF9F2]">Price: Low to High (₹)</option>
                  <option value="price-desc" className="bg-[#160E0A] text-[#FFF9F2]">Price: High to Low (₹)</option>
                  <option value="name-asc" className="bg-[#160E0A] text-[#FFF9F2]">Name: (A - Z)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterMode === 'all'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                  }`}
                >
                  All items
                </button>

                <button
                  onClick={() => setFilterMode('bestsellers')}
                  className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    filterMode === 'bestsellers'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bestsellers</span>
                </button>

                <button
                  onClick={() => setFilterMode('special')}
                  className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterMode === 'special'
                      ? 'bg-[#B97845] text-[#0A0908] shadow-md shadow-[#B97845]/20'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                  }`}
                >
                  Special
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pt-2 pb-1 select-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-[#F4E7D7] text-[#21150F]'
                  : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
              }`}
            >
              All Categories ({products.length})
            </button>

            {allCategories.map((cat) => {
              const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#F4E7D7] text-[#21150F]'
                      : 'bg-[#21150F] text-[#F4E7D7]/70 hover:text-[#FFF9F2] border border-[#3B2417]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

        </div>

        {/* Price Sorted Indicator Banner */}
        <div className="flex items-center justify-between mb-6 px-2 text-xs font-mono text-[#F4E7D7]/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B97845]" />
            <span>Showing <strong>{sortedAndFilteredProducts.length}</strong> items • Sorted by <strong>{sortOrder === 'price-asc' ? 'Lowest to Highest Price (₹)' : sortOrder === 'price-desc' ? 'Highest to Lowest Price (₹)' : 'Alphabetical'}</strong></span>
          </div>
          {sortedAndFilteredProducts.length > 0 && (
            <span className="text-[#C9945C] font-semibold">
              Price Range: ₹{Math.min(...sortedAndFilteredProducts.map(p => p.price))} – ₹{Math.max(...sortedAndFilteredProducts.map(p => p.price))}
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {sortedAndFilteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#160E0A] rounded-3xl border border-[#3B2417] p-8 space-y-4">
            <Coffee className="w-12 h-12 text-[#B97845] mx-auto opacity-50" />
            <h3 className="font-display text-2xl font-bold text-[#FFF9F2]">
              No Matches Found
            </h3>
            <p className="text-xs text-[#F4E7D7]/60 font-body">
              Try adjusting your search keywords or select another category above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAndFilteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenCustomizer={onOpenCustomizer}
                onOpenNotify={onOpenNotify}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
