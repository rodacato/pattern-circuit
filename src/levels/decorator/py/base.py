class Menu:
    # region: Menu#drink_for
    def drink_for(self, request):
        # region: Menu#drink_for:combo:oat
        if request.extras == ["oat"]:
            return OatMilkLatte()
        # endregion
        # region: Menu#drink_for:combo:shot
        elif request.extras == ["shot"]:
            return ShotLatte()
        # endregion
        # region: Menu#drink_for:combo:oat-shot
        elif request.extras == ["oat", "shot"]:
            return OatShotLatte()
        # endregion
        # region: Menu#drink_for:else
        else:
            raise Exception("There is no OatShotCinnamonLatte class")  # 3 extras = 8 classes; 4 extras = 16…
        # endregion
    # endregion
