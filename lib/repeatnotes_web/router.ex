defmodule RepeatNotesWeb.Router do
  use RepeatNotesWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
    plug(RepeatNotesWeb.APIAuthPlug, otp_app: :repeatnotes)
  end

  pipeline :api_protected do
    plug(Pow.Plug.RequireAuthenticated,
      error_handler: RepeatNotesWeb.APIAuthErrorHandler
    )
  end

  scope "/api", RepeatNotesWeb do
    pipe_through(:api)

    resources("/registration", RegistrationController, singleton: true, only: [:create])
    resources("/session", SessionController, singleton: true, only: [:create, :delete])

    post("/reset_password", UserController, :create_password_reset)
    put("/reset_password", UserController, :reset_password)

    post("/session/renew", SessionController, :renew)
  end

  scope "/api", RepeatNotesWeb do
    pipe_through([:api, :api_protected])

    resources("/cards", CardController)
    resources("/notes", NoteController)
    resources("/tags", TagController)

    patch("/notes/:id/action", NoteController, :patch)
    post("/notes/:note_id/tags", NoteController, :add_tag)
    delete("/notes/:note_id/tags/:tag_id", NoteController, :remove_tag)

    post("/cards/:id/action", CardController, :srs_action)

    get("/tags/:tag_id/notes", NoteController, :index_by_tag)

    post("/upload", NoteController, :upload)
    get("/stats", CardController, :stats)

    get("/srs_config", SrsConfigController, :show)
    put("/srs_config", SrsConfigController, :update)

    get("/me", SessionController, :me)
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through(:browser)
      live_dashboard("/dashboard", metrics: RepeatNotesWeb.Telemetry)
    end
  end

  scope "/", RepeatNotesWeb do
    pipe_through(:browser)

    get("/", PageController, :index)
    get("/*path", PageController, :index)
  end
end
