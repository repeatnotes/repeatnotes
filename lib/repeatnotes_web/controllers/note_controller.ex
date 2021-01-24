defmodule RepeatNotesWeb.NoteController do
  use RepeatNotesWeb, :controller

  alias Ecto.Changeset
  alias RepeatNotes.Users.User
  alias RepeatNotes.Notes
  alias RepeatNotes.Notes.Note
  alias RepeatNotesWeb.ErrorHelpers

  @spec index(Plug.Conn.t(), map) :: Plug.Conn.t()
  def index(conn, params) do
    with %User{id: user_id} <- conn.assigns.current_user do
      notes = Notes.list_notes(user_id, params)
      render(conn, "index.json", notes: notes)
    end
  end

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  def create(conn, %{"note" => params}) do
    with %User{id: user_id} <- conn.assigns.current_user do
      note_params = params |> Map.merge(%{"user_id" => user_id})

      conn
      |> note_with_card_transaction(note_params)
      |> RepeatNotes.Repo.transaction()
      |> case do
        {:ok, %{note: note}} ->
          conn
          |> put_status(:created)
          |> render("create.json", note: note)

        {:error, _op, changeset, _changes} ->
          errors = Changeset.traverse_errors(changeset, &ErrorHelpers.translate_error/1)

          conn
          |> put_status(400)
          |> json(%{error: %{status: 400, message: "Couldn't create note", errors: errors}})
      end
    end
  end

  @spec note_with_card_transaction(Conn.t(), map()) :: Ecto.Multi.t()
  def note_with_card_transaction(_conn, note_params) do
    Ecto.Multi.new()
    |> Ecto.Multi.run(:note, fn _repo, %{} ->
      RepeatNotes.Notes.create_note(note_params)
    end)
    |> Ecto.Multi.run(:card, fn _repo, %{note: note} ->
      card_params = note_params |> Map.merge(%{"note_id" => note.id})
      RepeatNotes.Cards.create_card(card_params)
    end)
  end

  @spec show(Plug.Conn.t(), map) :: Plug.Conn.t()
  def show(conn, %{"id" => id}) do
    note = Notes.get_note!(id)
    render(conn, "show.json", note: note)
  end

  @spec random(Plug.Conn.t(), map) :: Plug.Conn.t()
  def random(conn, _params) do
    with %User{id: user_id} <- conn.assigns.current_user do
      notes = Notes.random_notes(user_id)
      render(conn, "index.json", notes: notes)
    end
  end

  @spec update(Plug.Conn.t(), map) :: Plug.Conn.t()
  def update(conn, %{"id" => id, "note" => note_params}) do
    with %User{id: user_id} <- conn.assigns.current_user do
      note = Notes.get_note!(id, user_id)

      case Notes.update_note(note, note_params) do
        {:ok, %Note{} = note} ->
          conn
          |> put_status(:ok)
          |> render("update.json", note: note)

        {:error, changeset} ->
          errors = Changeset.traverse_errors(changeset, &ErrorHelpers.translate_error/1)

          conn
          |> put_status(400)
          |> json(%{error: %{status: 400, message: "Couldn't update note", errors: errors}})
      end
    end
  end
end