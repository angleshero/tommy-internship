
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";

const Author = () => {
  const { authorId } = useParams();

  // ✅ HARD GUARD: never render without a valid authorId
  if (!authorId) {
    return <Navigate to="/" replace />;
  }

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);

  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const followClickLockRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchAuthor() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        if (isMounted) {
          setAuthor(data);
          setFollowersCount(Number(data?.followers ?? 0));
          setIsFollowed(false);
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          setError("Failed to load author.");
          setAuthor(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAuthor();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorId, API_URL]);

  const onToggleFollow = () => {
    if (followClickLockRef.current) return;
    followClickLockRef.current = true;

    setIsFollowed((prev) => {
      setFollowersCount((count) =>
        prev ? Math.max(0, count - 1) : count + 1
      );
      return !prev;
    });

    setTimeout(() => {
      followClickLockRef.current = false;
    }, 0);
  };

  const onCopy = async () => {
    if (author?.address) {
      await navigator.clipboard.writeText(author.address);
    }
  };

  const authorName = author?.authorName || "Loading...";
  const tag = author?.tag ? `@${author.tag}` : "";
  const address = author?.address || "";
  const authorImage = author?.authorImage || AuthorImageFallback;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <section
          id="profile_banner"
          className="text-light"
          style={{ background: `url(${AuthorBanner}) top` }}
        />

        <section>
          <div className="container">
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && author && (
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                  <div className="profile_avatar">
                    <Link to={`/author/${authorId}`}>
                      <img
                        src={authorImage}
                        alt={authorName}
                        onError={(e) =>
                          (e.currentTarget.src = AuthorImageFallback)
                        }
                      />
                      <i className="fa fa-check" />
                    </Link>

                    <div className="profile_name">
                      <h4>
                        {authorName}
                        {tag && <span className="profile_username">{tag}</span>}
                        {address && (
                          <span className="profile_wallet">{address}</span>
                        )}
                        <button id="btn_copy" onClick={onCopy}>
                          Copy
                        </button>
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="profile_follow de-flex">
                  <div className="de-flex-col">
                    <div className="profile_follower">
                      {followersCount} followers
                    </div>

                    <button className="btn-main" onClick={onToggleFollow}>
                      {isFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ PASS authorId CORRECTLY */}
            {!loading && author && (
              <div className="de_tab tab_simple">
                <AuthorItems authorId={author.authorId} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;

