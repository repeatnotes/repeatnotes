defmodule RepeatNotes.Sm2.Sm2Test do
  use ExUnit.Case

  alias RepeatNotes.Sm2
  alias RepeatNotes.Sm2.{Config, Card}

  test "load config success" do
    scheduler = Sm2.new(%Config{})
    assert Sm2.next_interval(%Card{}, scheduler, :again) > 0
  end

  test "load answer card success" do
    scheduler = Sm2.new(%Config{})
    card = Sm2.answer_card(%Card{}, scheduler, :again)
    assert card.due > 0
  end
end
