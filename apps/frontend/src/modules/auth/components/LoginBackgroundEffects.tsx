export function LoginBackgroundEffects() {
  const loginVideoSrc = `${import.meta.env.BASE_URL}videos/login-bg.mp4`;

  return (
    <>
      <div className="login-bg-fallback" aria-hidden="true" />
      <video
        className="login-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      >
        <source src={loginVideoSrc} type="video/mp4" />
      </video>
      <div className="login-bg-overlay" aria-hidden="true" />
    </>
  );
}
