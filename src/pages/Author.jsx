
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";
import { useParams } from "react-router-dom";

const Author = () => {
  const { authorId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);

  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const followClickLockRef = useRef(false);

  const { id } = useParams();

  useEffect(() => {
    // ✅ HARD GUARD — never fetch without ID
    if (!authorId) {
      setError("Invalid author URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

    async function fetchAuthor() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();

        if (isMounted) {
          setAuthor(data);
          setFollowersCount(Number(data?.followers ?? 0));
          setIsFollowed(false);
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          console.error(err);
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
  }, [authorId]);

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

  // ✅ Render error clearly (instead of broken UI)
  if (error && !loading) {
    return (
      <div className="container" style={{ padding: "40px 0" }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

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
            {loading && <div>Loading author...</div>}

            {!loading && author && (
              <>
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <Link to={`/author/${authorId}`}>
                        <img
                          src={author.authorImage || AuthorImageFallback}
                          alt={author.authorName}
                          onError={(e) =>
                            (e.currentTarget.src = AuthorImageFallback)
                          }
                        />
                        <i className="fa fa-check" />
                      </Link>

                      <div className="profile_name">
                        <h4>
                          {author.authorName}
                          {author.tag && (
                            <span className="profile_username">
                              @{author.tag}
                            </span>
                          )}
                          {author.address && (
                            <span className="profile_wallet">
                              {author.address}
                            </span>
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

                {/* ✅ AuthorItems gets authorId from API */}
                <div className="de_tab tab_simple">
                  <AuthorItems authorId={author.authorId} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
