import React from "react";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Interfaces
interface Post {
  id: string;
  caption: string;
  timestamp: string;
  reach: number;
  platform: string; // Identifica si es de Facebook o Instagram
  media_type: string; // Tipo de publicación: imagen, video, o carrusel
  image_url: string; // URL de la imagen asociada
}

interface CombinedTopReachResponse {
  top_posts: Post[];
  message: string;
}

// Función para obtener datos combinados de Facebook e Instagram
const fetchCombinedTopReachPosts = async (page_id: string): Promise<CombinedTopReachResponse> => {
  const facebookUrl = "http://localhost:5000/api/facebook/facebook_top_reach";
  const instagramUrl = "http://localhost:5000/api/instagram/instagram_top_reach";
  const csrfToken = Cookies.get("csrf_access_token");

  // Consultar ambas APIs
  const [facebookResponse, instagramResponse] = await Promise.all([
    axios.post<{ top_posts: Post[] }>(
      facebookUrl,
      { page_id },
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken || "",
        },
        withCredentials: true,
      }
    ),
    axios.post<{ top_posts: Post[] }>(
      instagramUrl,
      { page_id },
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken || "",
        },
        withCredentials: true,
      }
    ),
  ]);

  // Agregar la plataforma (Facebook o Instagram) y procesar el tipo de publicación
  const facebookPosts = facebookResponse.data.top_posts.map((post) => ({
    ...post,
    platform: "Facebook",
    image_url: post.image_url || "URL no disponible", // Asegurarse de incluir el campo image_url
  }));
  const instagramPosts = instagramResponse.data.top_posts.map((post) => ({
    ...post,
    platform: "Instagram",
    image_url: post.image_url || "URL no disponible", // Asegurarse de incluir el campo image_url
  }));

  // Combinar y ordenar por alcance
  const combinedPosts = [...facebookPosts, ...instagramPosts].sort((a, b) => b.reach - a.reach);

  // Seleccionar las 5 publicaciones con mayor alcance
  const top5Posts = combinedPosts.slice(0, 5);

  return {
    top_posts: top5Posts,
    message: "Top 5 publicaciones combinadas con mayor alcance obtenidas correctamente",
  };
};

const CombinedTopReachPostsTable: React.FC<{ page_id: string; theme: string }> = ({ page_id }) => {
  const { data: topPostsData, isLoading, isError, error } = useQuery<CombinedTopReachResponse>({
    queryKey: ["combinedTopReachPosts", page_id],
    queryFn: async () => {
      if (!page_id) throw new Error("No se ha seleccionado una página.");
      return await fetchCombinedTopReachPosts(page_id);
    },
    enabled: !!page_id,
    refetchInterval: 60000,
  });

  // Función para truncar palabras
  const truncateWords = (text: string, wordLimit: number): string => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="loading loading-spinner loading-lg text-green-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 mt-4">
        Error al cargar las publicaciones con mayor alcance: {(error as Error).message}
      </div>
    );
  }

  const topPosts = topPostsData?.top_posts || [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      
      <table id="top-posts-table" className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-center">Imagen</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Fecha de Publicación</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Alcance</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Plataforma</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Tipo de Contenido</th>
          </tr>
        </thead>
        <tbody>
          {topPosts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                <img
                  src={post.image_url}
                  alt={`Imagen de la publicación ${post.id}`}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {truncateWords(post.caption || "Sin título", 10)} {/* Limitar a 10 palabras */}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(post.timestamp).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {post.reach.toLocaleString()} Alcance
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">{post.platform}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">{post.media_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CombinedTopReachPostsTable;
