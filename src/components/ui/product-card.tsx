"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Tilt from "react-parallax-tilt";

interface ProductCardProps {
  id?: string;
  sellerSlug?: string;
  image: string;
  title: string;
  rating: number;
  price: string;
  originalPrice?: string;
  badge?: string;
  location?: string;
  actionText: string;
  isService?: boolean;
  href?: string;
  onClick?: () => void;
}

export function ProductCard({
  id,
  sellerSlug,
  image,
  title,
  rating,
  price,
  originalPrice,
  badge,
  location,
  actionText,
  isService,
  href,
  onClick,
}: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      router.push(href);
      return;
    }
    if (id) {
      router.push(`/product/${encodeURIComponent(id)}${sellerSlug ? `?seller=${encodeURIComponent(sellerSlug)}` : ""}`);
    }
  };

  return (
    <Tilt 
      tiltMaxAngleX={10} 
      tiltMaxAngleY={10} 
      perspective={1000}
      transitionSpeed={1000}
      scale={1.02}
      className="h-full"
    >
      <div 
        onClick={handleCardClick}
        className="group relative bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col cursor-pointer"
        title={`Click to view details of ${title}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/70 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white hover:scale-110 transition-all shadow-sm z-10 cursor-pointer"
            title="Save to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          {badge && (
            <Badge className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white hover:bg-indigo-600 border-0 shadow-sm font-medium z-10 px-3 py-1">
              {badge}
            </Badge>
          )}
          {/* Subtle inner shadow overlay for 3D effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-grow relative z-10 bg-white">
          <h3 className="font-bold text-gray-900 line-clamp-1 mb-1.5 text-lg group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span className="text-sm font-bold text-gray-700">{rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-end gap-2 mb-auto pb-4">
            <div className="font-extrabold text-xl text-indigo-600">{price}</div>
            {originalPrice && (
              <div className="text-sm text-gray-400 line-through mb-[3px] font-medium">{originalPrice}</div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
            {location ? (
              <div className="flex items-center text-xs font-semibold text-gray-500 gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span className="truncate max-w-[120px]">{location}</span>
              </div>
            ) : (
              <div />
            )}
            <Button 
              variant={isService ? "secondary" : "default"} 
              className={isService ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none font-bold" : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-600/20 font-bold hover:scale-105 transition-transform"}
              size="sm"
            >
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    </Tilt>
  );
}
