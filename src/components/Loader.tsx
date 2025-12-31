// components/ContentLoader.tsx
const ContentLoader = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center m-4  bg-[#ecfaf8] backdrop-blur-sm">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009788d5]"></div>
    </div>
  );
};

export default ContentLoader;
