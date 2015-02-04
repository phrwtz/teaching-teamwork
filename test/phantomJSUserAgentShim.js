// RapahaelJS checks for Safari's userAgent and borks if it doesn't see what it expects

var newNavigator = Object.create(window.navigator);
newNavigator.userAgent = "Version/7.1.2 ";
navigator = newNavigator;
