import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Eye } from "lucide-react";

interface FilmCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  filmmaker: string;
  filmmakerProfileId: string;
  viewCount: number;
  genre: string | null;
}

const FilmCard = ({ id, title, thumbnailUrl, filmmaker, filmmakerProfileId, viewCount, genre }: FilmCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="film-card group"
    >
      <Link to={`/watch/${id}`}>
        <div className="aspect-[2/3] bg-muted relative overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-contain bg-muted" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play size={40} className="text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
            <Play
              size={48}
              className="text-background opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            />
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/watch/${id}`}>
          <h3 className="font-display text-lg font-semibold truncate hover:underline">{title}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <Link
            to={`/profile/${filmmakerProfileId}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
          >
            {filmmaker}
          </Link>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye size={14} />
            <span className="font-body">{viewCount}</span>
          </div>
        </div>
        {genre && (
          <span className="inline-block mt-2 text-xs border border-border px-2 py-1 text-muted-foreground font-body">
            {genre}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FilmCard;
