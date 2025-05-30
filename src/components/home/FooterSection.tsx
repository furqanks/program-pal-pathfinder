
export default function FooterSection() {
  return (
    <footer className="py-16 bg-slate-950 text-slate-400">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              UniApp Space
            </h2>
            <p className="text-slate-400">Your AI-powered university application assistant</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:items-center text-center md:text-left">
            <div className="space-y-4">
              <p className="text-sm">© 2025 UniApp Space. All rights reserved.</p>
              <div className="flex justify-center md:justify-start space-x-6">
                <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
