import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Eye } from "lucide-react";

interface VerticalFilmCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  filmmaker: string;
  filmmakerProfileId: string;
  viewCount: number;
}

const VerticalFilmCard = ({ id, title, thumbnailUrl, filmmaker, filmmakerProfileId, viewCount }: VerticalFilmCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex-shrink-0 w-44 sm:w-48"
    >
      <Link to={`/reels/${id}`}>
        <div className="aspect-[9/16] bg-muted relative overflow-hidden rounded-lg border border-border">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent">
              <Play size={32} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play
              size={36}
              className="text-background opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            />
          </div>
          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-foreground/80 to-transparent">
            <h3 className="text-sm font-display font-semibold text-background truncate">{title}</h3>
            <div className="flex items-center justify-between mt-1">
              <Link
                to={`/profile/${filmmakerProfileId}`}
                className="text-xs text-background/80 hover:text-background transition-colors font-body truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {filmmaker}
              </Link>
              <div className="flex items-center gap-1 text-xs text-background/70">
                <Eye size={12} />
                <span className="font-body">{viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VerticalFilmCard;
