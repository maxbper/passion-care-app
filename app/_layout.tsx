import { Slot, usePathname } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import BottomNav from "../components/bottomNav";
import Sidebar from "../components/sidebar";
import React from "react";
import Header from "../components/header";
import ProfileModal from "../components/profileModal";
import { ProfileModalProvider, useProfileModal } from "../context/ProfileModalContext";
import UserBasedDetailColorProvider from "../context/cancerColorProvider";
import { LocaleConfig } from "react-native-calendars";
import { useTranslation } from 'react-i18next';

function LayoutContent() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDontExercisePage = pathname === "/dontExercise";
  const isHomePage = pathname === "/home";
  const isExercisePage = pathname === "/exercise";
  const page = isLoginPage || isDontExercisePage || isHomePage || isExercisePage;
  const { isVisible, hideModal } = useProfileModal();

  const { t } = useTranslation();
  React.useEffect(() => {
    LocaleConfig.locales['custom'] = {
      monthNames: [
        t('months.january'), t('months.february'), t('months.march'),
        t('months.april'), t('months.may'), t('months.june'),
        t('months.july'), t('months.august'), t('months.september'),
        t('months.october'), t('months.november'), t('months.december')
      ],
      monthNamesShort: [
        t('monthsShort.jan'), t('monthsShort.feb'), t('monthsShort.mar'),
        t('monthsShort.apr'), t('monthsShort.may'), t('monthsShort.jun'),
        t('monthsShort.jul'), t('monthsShort.aug'), t('monthsShort.sep'),
        t('monthsShort.oct'), t('monthsShort.nov'), t('monthsShort.dec')
      ],
      dayNames: [
        t('days.sunday'), t('days.monday'), t('days.tuesday'),
        t('days.wednesday'), t('days.thursday'), t('days.friday'),
        t('days.saturday')
      ],
      dayNamesShort: [
        t('daysShort.sun'), t('daysShort.mon'), t('daysShort.tue'),
        t('daysShort.wed'), t('daysShort.thu'), t('daysShort.fri'),
        t('daysShort.sat')
      ],
      today: t('today')
    };

    LocaleConfig.defaultLocale = 'custom';
  }, [t]);

  return (
    <>
    <View style={{ flex: 1, flexDirection: Platform.OS === "web" ? "row" : "column", backgroundColor: "#F9FAFB" }}>
      <Header />
      {Platform.OS !== "web" && !isLoginPage && !isDontExercisePage && !isHomePage && <BottomNav />}
      {Platform.OS === "web" && !isLoginPage && <Sidebar />}
      {!page ? (
      <ScrollView>
      <Slot />
      </ScrollView>
      ) : (
        <Slot />
      )}
    </View>
    {Platform.OS !== "web" && <ProfileModal visible={isVisible} onClose={hideModal} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <UserBasedDetailColorProvider>
    <ProfileModalProvider>
      <LayoutContent />
    </ProfileModalProvider>
    </UserBasedDetailColorProvider>
  );
}